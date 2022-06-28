import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { eventProviders } from './users.providers';
import { EventsController } from './events.controller';

@Module({
  providers: [EventsService, ...eventProviders],
  exports:[EventsService],
  controllers: [EventsController]
})
export class EventsModule {}
