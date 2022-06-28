import { Sequelize } from 'sequelize-typescript';
import { Reservation } from 'src/models/reservation.model';
import { Ticket } from 'src/models/ticket.model';
import { RESERVATION_REPOSITORY, SEQUELIZE, TICKET_REPOSITORY } from '../../core/constants';

export const reservationProvider = [{
    provide: RESERVATION_REPOSITORY,
    useValue: Reservation,
}, {
    provide: TICKET_REPOSITORY,
    useValue: Ticket,
}
];