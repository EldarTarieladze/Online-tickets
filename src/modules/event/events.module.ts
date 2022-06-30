import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { eventProviders } from './events.providers';
import { EventsService } from './events.service';

@Module({
  providers: [EventsService, ...eventProviders],
  exports: [EventsService],
  controllers: [EventsController],
})
export class EventsModule {}
