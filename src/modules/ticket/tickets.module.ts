import { Module } from '@nestjs/common';
import { ticketProviders } from './ticket.providers';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  providers:[TicketsService, ...ticketProviders],
  exports:[TicketsService],
  controllers: [TicketsController]
})
export class TicketsModule {}
