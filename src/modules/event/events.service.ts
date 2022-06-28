import { Inject, Injectable } from '@nestjs/common';
import { EVENTS_REPOSITORY } from 'src/core/constants';
import { Events } from 'src/models/event.model';
import { Ticket } from 'src/models/ticket.model';

@Injectable()
export class EventsService {
    constructor(@Inject(EVENTS_REPOSITORY) private readonly eventsRepository: typeof Events){}

    async getEvents(){
        return await this.eventsRepository.findAll({include: Ticket})
    }
}
