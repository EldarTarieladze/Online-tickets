import { Inject, Injectable } from '@nestjs/common';
import { TICKET_REPOSITORY } from 'src/core/constants';
import { Events } from 'src/models/event.model';
import { Ticket } from 'src/models/ticket.model';

@Injectable()
export class TicketsService {
    constructor(@Inject(TICKET_REPOSITORY) private readonly ticketRepository: typeof Ticket){}

    async getTickets(){
        const tickets = await this.ticketRepository.findAll()
        return tickets
    }
}
