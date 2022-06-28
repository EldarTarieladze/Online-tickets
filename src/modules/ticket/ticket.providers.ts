import { Ticket } from 'src/models/ticket.model';
import { TICKET_REPOSITORY } from '../../core/constants';

export const ticketProviders = [{
    provide: TICKET_REPOSITORY,
    useValue: Ticket,
}];