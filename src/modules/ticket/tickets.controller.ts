import { Controller, Get } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketService: TicketsService){}

    @Get()
    async getTickets(){
        return await this.ticketService.getTickets()
    }
}
