import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { EventsModule } from './modules/event/events.module';
import { TicketsService } from './modules/ticket/tickets.service';
import { TicketsModule } from './modules/ticket/tickets.module';
import { ReservationModule } from './modules/reservation/reservation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ReservationModule,
    DatabaseModule,
    EventsModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
