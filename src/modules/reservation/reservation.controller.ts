import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Reservation } from 'src/models/reservation.model';
import { IResponseCreateReservationDto } from './dto/createReservation.dto';
import {
  CreateReservationDto,
  IResponseReservationDto,
} from './dto/reservation.dto';
import { ReservationService } from './reservation.service';

export interface ITypeRes {
  message: string;
}
@Controller('reservation')
@ApiTags('Reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) { }

  @Post('create')
  @ApiCreatedResponse({ type: IResponseCreateReservationDto })
  async createReservation(@Body() dto: CreateReservationDto) {
    return await this.reservationService.createReservation(dto);
  }
  @Get()
  @ApiOkResponse({ type: IResponseReservationDto, isArray: true })
  async getReservation() {
    return await this.reservationService.getReservation();
  }
  @Post('payment/:reservationId')
  @ApiCreatedResponse({ type: IResponseCreateReservationDto })
  async paymentReservation(
    @Param('reservationId', new ParseIntPipe()) reservationId: number,
  ) {
    return await this.reservationService.paymentReservation(reservationId);
  }
}
