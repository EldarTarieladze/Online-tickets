import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateReservationDto } from './dto/reservation.dto';
import { ReservationService } from './reservation.service';

@Controller('reservation')
@ApiTags('Reservation')
export class ReservationController {
    constructor(private readonly reservationService: ReservationService){}

    @Post('create')
    async createReservation(@Body() dto: CreateReservationDto ){
        return await this.reservationService.createReservation(dto)
    }

}
