import { Inject, Injectable } from '@nestjs/common';
import { TICKET_REPOSITORY } from 'src/core/constants';
import { Events } from 'src/models/event.model';
import { Reservation } from 'src/models/reservation.model';
import { Ticket } from 'src/models/ticket.model';

@Injectable()
export class TicketsService {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly ticketRepository: typeof Ticket,
  ) {}

  async getTickets(): Promise<Ticket[]> {
    const tickets = await this.ticketRepository.findAll({
      order: [['id', 'ASC']],
    });
    return tickets;
  }
}
