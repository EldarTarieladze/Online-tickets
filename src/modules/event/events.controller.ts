import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { Events } from 'src/models/event.model';
import { IResponseEventWithTicketsDto } from './dto/events.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventService: EventsService) {}

  @Get()
  @ApiOkResponse({ type: IResponseEventWithTicketsDto, isArray: true })
  async getEvents(): Promise<Events[]> {
    return await this.eventService.getEvents();
  }
}
