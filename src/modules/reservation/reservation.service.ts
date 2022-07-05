import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Stripe } from 'stripe';

import {
  RESERVATION_REPOSITORY,
  SEQUELIZE,
  TICKET_REPOSITORY,
} from 'src/core/constants';
import { Reservation } from 'src/models/reservation.model';
import { Ticket } from 'src/models/ticket.model';
import { CreateReservationDto } from './dto/reservation.dto';
import { FAILED, NOT_PAID, PAID, PROCESS, STRIPE_SUCCEEDED } from './constants';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

export enum sellingOptions {
  AVOID_ONE = 'AVOID_ONE',
  ALL_TOGETHER = 'ALL_TOGETHER',
  EVEN = 'EVEN',
}

function groupBy(arr: Ticket[], prop: string) {
  const map = new Map(Array.from(arr, (obj) => [obj[prop], []]));
  arr.forEach((obj) => map.get(obj[prop]).push(obj));
  return Array.from(map.values());
}

@Injectable()
export class ReservationService {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationReopsitory: typeof Reservation,
    @Inject(TICKET_REPOSITORY) private readonly ticketRepository: typeof Ticket,
    @Inject(SEQUELIZE) private sequelize: Sequelize,
    private schedulerRegistry: SchedulerRegistry
  ) { }


  // Cron job for expired reservation
  @Cron(CronExpression.EVERY_30_SECONDS, { name: 'reservations' })
  async deleteExpiredReservations() {
    const timeToExpired = process.env.EXPIRED_TIME
    const deletedReservationCount = await this.reservationReopsitory.destroy({
      where: {
        paymentStatus: [FAILED, NOT_PAID],
        [Op.and]: [
          Sequelize.literal(`created_at < NOW() - INTERVAL '${timeToExpired}'`),
        ]
      }
    })
    console.log(`${deletedReservationCount} expired reservation has been deleted`)

  }

  async getReservation() {
    const reservations = await this.reservationReopsitory.findAll({
      include: Ticket,
    });
    return reservations;
  }

  async createReservation(dto: CreateReservationDto) {
    const trans = await this.sequelize.transaction();
    try {
      const lockTickets: Ticket[] = [];
      let priceOfAllTicket: number = 0;
      let ticketGroupByRowNumber: Array<Ticket[]> = [];
      for await (const tId of dto.ticketIds) {
        const ticket = await this.ticketRepository.findByPk<Ticket>(tId, {
          lock: true,
          skipLocked: true,
          transaction: trans,
        });
        if (!ticket) {
          throw new HttpException(
            { message: `ticket with the Id ${tId} is not available!` },
            HttpStatus.NOT_FOUND,
          );
        }
        if (ticket.reservationId) {
          throw new HttpException(
            { message: `Ticket with Id ${tId} is already reserved!` },
            HttpStatus.FORBIDDEN,
          );
        }

        if (ticket.eventId !== dto.eventId) {
          throw new HttpException(
            { message: `Ticket with Id ${tId} is for another event!` },
            HttpStatus.BAD_REQUEST,
          );
        }
        priceOfAllTicket += ticket.price;
        lockTickets.push(ticket);
      }
      // Tickets are grouped by row number
      ticketGroupByRowNumber = groupBy(lockTickets, 'rowNumber');

      for await (const ticketArray of ticketGroupByRowNumber) {
        for await (const ticket of ticketArray) {
          for await (const option of ticket.sellingOptions) {
            switch (option) {
              case sellingOptions.EVEN:
                // The number of tickets must be even
                if (lockTickets.length % 2 !== 0)
                  throw new HttpException(
                    {
                      message: `Ticket Id ${ticket.id} has EVEN selling option, you have to buy EVEN Tickets`,
                    },
                    HttpStatus.FORBIDDEN,
                  );
                break;

              case sellingOptions.AVOID_ONE:
                // The number of free seats in a specific row should not be 1
                const availableTicket =
                  await this.ticketRepository.findAndCountAll({
                    where: {
                      eventId: ticket.eventId,
                      rowNumber: ticket.rowNumber,
                      reservationId: null,
                    },
                    skipLocked: true,
                    transaction: trans,
                  });
                if (availableTicket.count === 1)
                  throw new HttpException(
                    {
                      message: `Ticket Id ${ticket.id} has AVOID_ONE selling option`,
                    },
                    HttpStatus.FORBIDDEN,
                  );
                break;
              case sellingOptions.ALL_TOGETHER:
                /* Sort ticket array by id for example [5,4,6,7] sorted [4,5,6,7]
                   then check if( 7-4 !== 3)
                */
                ticketArray.sort(({ id: a }, { id: b }) => a - b);
                if (
                  ticketArray[ticketArray.length - 1].rowNumber - ticketArray[0].rowNumber !==
                  ticketArray.length - 1
                ) {
                  throw new HttpException(
                    {
                      message: `Ticket Id ${ticket.id} has ALL_TOGETHER selling option`,
                    },
                    HttpStatus.FORBIDDEN,
                  );
                }
                break;
              default:
                throw new InternalServerErrorException({ message: 'Not valid selling options' })
                break;
            }
          }
        }
      }
      const newReservation = await this.reservationReopsitory.create(
        {
          price: priceOfAllTicket,
          userId: dto.userId,
        },
        { transaction: trans },
      );
      await this.ticketRepository.update(
        { reservationId: newReservation.id },
        { where: { id: dto.ticketIds }, transaction: trans },
      );

      await trans.commit();
      return { message: 'Reservation completed successfully' };
    } catch (error) {
      await trans.rollback();
      throw error;
    }
  }

  timeDifference(createdAt: string): boolean {
    let reservationCreatedAt = new Date(createdAt);
    let currentTime = new Date();
    let difference = currentTime.getTime() - reservationCreatedAt.getTime();

    // 900000 = 15min
    return difference > 900000 ? false : true;
  }

  async paymentReservation(reservationId: number) {
    let trans: any;
    try {
      trans = await this.sequelize.transaction();
      const reservation = await this.reservationReopsitory.findByPk(
        reservationId,
        { transaction: trans, lock: true, skipLocked: true },
      );

      if (!reservation)
        throw new NotFoundException({ message: 'Reservation not found' });

      const difference = this.timeDifference(reservation.createdAt);
      if (!difference)
        throw new ForbiddenException({
          message: 'The reservation has expired',
        });
      if (reservation.paymentStatus === 'PROCESS') throw new ConflictException({ message: 'Reservation is already in process' })
      if (reservation.paymentStatus === 'PAID') throw new BadRequestException({ message: 'Reservation is already PAID' })
      const stripe = new Stripe(process.env.STRIPE_API_SECRET_KEY, {
        apiVersion: '2020-08-27',
      });

      await this.reservationReopsitory.update({ paymentStatus: PROCESS }, {
        where: {
          id: reservation.id
        }, transaction: trans
      })
      // static payment costumerID
      const payment = await stripe.paymentIntents.create({
        amount: reservation.price * 100,
        currency: 'USD',
        description: 'Ticket Reservation',
        customer: process.env.STRIPE_STATIC_COSTUMER_ID,
        payment_method_types: ['card'],
        capture_method: 'automatic',
        confirm: true,
      });
      if (payment.status !== STRIPE_SUCCEEDED) {
        await this.reservationReopsitory.update({ paymentStatus: FAILED }, {
          where: {
            id: reservation.id
          },
          transaction: trans
        })
        await trans.commit()
        throw new HttpException({ message: 'Payment is unsuccessful' }, HttpStatus.BAD_REQUEST)
      }
      await this.reservationReopsitory.update({ paymentStatus: PAID }, {
        where: {
          id: reservation.id
        }, transaction: trans
      })
      await trans.commit()
      return { message: 'Payment completed successfully' }
    } catch (error) {
      if (trans?.finished !== 'commit') await trans.rollback();
      throw error;
    }
  }
}
