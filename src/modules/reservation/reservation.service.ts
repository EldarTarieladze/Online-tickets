import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize/types';
import { Stripe } from 'stripe';

import {
  RESERVATION_REPOSITORY,
  SEQUELIZE,
  TICKET_REPOSITORY,
} from 'src/core/constants';
import { Reservation } from 'src/models/reservation.model';
import { Ticket } from 'src/models/ticket.model';
import { CreateReservationDto } from './dto/reservation.dto';

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
  ) {}
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
          console.log(1);
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
                if (lockTickets.length % 2 !== 0)
                  throw new HttpException(
                    {
                      message: `Ticket Id ${ticket.id} has EVEN selling option, you have to buy EVEN Tickets`,
                    },
                    HttpStatus.FORBIDDEN,
                  );
                break;

              case sellingOptions.AVOID_ONE:
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
                ticketArray.sort(({ id: a }, { id: b }) => a - b);
                if (
                  ticketArray[ticketArray.length - 1].id - ticketArray[0].id !==
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
  async getReservation() {
    const reservations = await this.reservationReopsitory.findAll({
      include: Ticket,
    });
    return reservations;
  }
  timeDifference(createdAt: string): boolean {
    let reservationCreatedAt = new Date(createdAt);
    let currentTime = new Date();
    console.log({ reservationCreatedAt, currentTime });
    let difference = currentTime.getTime() - reservationCreatedAt.getTime();

    // 900000 = 15min
    return difference > 900000 ? false : true;
  }
  async paymentReservation(reservationId: number) {
    const trans = await this.sequelize.transaction();
    try {
      const reservation = await this.reservationReopsitory.findByPk(
        reservationId,
        { transaction: trans, lock: true, skipLocked: true },
      );

      if (!reservation)
        throw new BadRequestException({ message: 'Reservation not found' });

      const difference = this.timeDifference(reservation.createdAt);
      if (!difference)
        throw new ForbiddenException({
          message: 'The reservation has expired',
        });
      const body = {
        amount: reservation.price,
        description: 'Ticket Reservation',
        currency: 'usd',
        customer: reservation.userId,
      };
      const stripe = new Stripe(process.env.STRIPE_API_SECRET_KEY, {
        apiVersion: '2020-08-27',
      });
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: '4242424242424242',
          exp_month: 6,
          exp_year: 2071,
          cvc: '314',
        },
      });
      console.log(paymentMethod, paymentMethod.id);
      const stripeReg = await stripe.customers.create({
        email: 'tt@gmail.com',
        description: 'asdaa',
      });
      const attach = await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: stripeReg.id,
      });
      console.log(attach);
      //fix
      const payment = await stripe.paymentIntents.create({
        amount: reservation.price * 100,
        currency: 'USD',
        description: 'Ticket Reservation',
        customer: stripeReg.id,
        payment_method_types: ['card'],
        capture_method: 'automatic',
        confirm: true,
      });
      console.log(payment);
      throw new BadRequestException({ message: 'saa' });
    } catch (error) {
      await trans.rollback();
      throw error;
    }
  }
}
