import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
    constructor(private readonly eventService: EventsService){}

    @Get()
    async getEvents(){
        return await this.eventService.getEvents()
    }

}
