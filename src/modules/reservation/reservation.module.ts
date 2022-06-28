import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { reservationProvider } from './reservation.provider';
import { SequelizeModule } from '@nestjs/sequelize';
import { Ticket } from 'src/models/ticket.model';
import { Reservation } from 'src/models/reservation.model';
import { databaseProviders } from 'src/core/database/database.providers';
import { SEQUELIZE } from 'src/core/constants';
import { Sequelize } from 'sequelize-typescript';
import sequelize from 'sequelize';

@Module({
  imports:[],
  providers: [ReservationService, ...reservationProvider],
  controllers: [ReservationController]
})
export class ReservationModule {}
