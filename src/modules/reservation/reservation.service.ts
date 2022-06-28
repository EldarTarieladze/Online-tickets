import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize/types';
import { RESERVATION_REPOSITORY, SEQUELIZE, TICKET_REPOSITORY } from 'src/core/constants';
import { Reservation } from 'src/models/reservation.model';
import { Ticket } from 'src/models/ticket.model';
import { CreateReservationDto } from './dto/reservation.dto';

export enum sellingOptions {
    AVOID_ONE = 'AVOID_ONE',
    ALL_TOGETHER = 'ALL_TOGETHER',
    EVEN = 'EVEN'
}

@Injectable()
export class ReservationService {
    constructor(
        @Inject(RESERVATION_REPOSITORY) private readonly reservationReopsitory: typeof Reservation,
        @Inject(TICKET_REPOSITORY) private readonly ticketRepository: typeof Ticket,
        @Inject(SEQUELIZE) private sequelize: Sequelize
    ) { }

    async createReservation(dto: CreateReservationDto) {
        const trans = await this.sequelize.transaction()
        try {
            const lockTickets: Ticket[] = []
            for await (const tId of dto.ticketIds) {
                const ticket = await this.ticketRepository.findByPk<Ticket>(tId, { lock: true, skipLocked: true, transaction: trans })
                if (!ticket) {
                    console.log(1)
                    throw new HttpException({ message: `ticket with the Id ${tId} is not available!` }, HttpStatus.NOT_FOUND)
                }

                if (ticket.reservationId) {
                    throw new HttpException({ message: `Ticket with Id ${tId} is already reserved!` }, HttpStatus.FORBIDDEN)
                }

                lockTickets.push(ticket)
            }

            for await (const ticket of lockTickets) {
                for await (const option of ticket.sellingOptions) {
                    switch (option) {
                        case sellingOptions.EVEN:
                            if (lockTickets.length % 2 !== 0) throw new HttpException({ message: `Ticket Id ${ticket.id} has EVEN selling option, you have to buy EVEN Tickets` }, HttpStatus.FORBIDDEN)
                            break;

                        case sellingOptions.AVOID_ONE:
                            const availableTicket = await this.ticketRepository.findAndCountAll({
                                where: {
                                    eventId: ticket.eventId,
                                    rowNumber: ticket.rowNumber,
                                    reservationId: null
                                },
                                skipLocked: true,
                                transaction: trans
                            })
                            if (availableTicket.count === 1) throw new HttpException({ message: `Ticket Id ${ticket.id} has AVOID_ONE selling option` }, HttpStatus.FORBIDDEN)
                            break;
                        case sellingOptions.ALL_TOGETHER:
                                const sortedTicket = dto.ticketIds.sort()
                                console.log(sortedTicket[sortedTicket.length-1] - sortedTicket[0] === sortedTicket.length -1)
                                // if(sortedTicket[sortedTicket.length-1] - sortedTicket[0] === sortedTicket.length -1)


                            break
                        default:
                            break;
                    }
                }
            }
            await trans.commit()
            return lockTickets

        } catch (error) {
            await trans.rollback()
            throw error
        }
    }
}
