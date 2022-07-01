import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  ArrayUnique,
  IsString,
  Min,
} from 'class-validator';
import { IResponseTicketDto } from 'src/modules/ticket/dto/ticket.dto';

export class CreateReservationDto {
  @ApiProperty({ description: 'array of tickets Ids', default: [1, 2, 3, 4] })
  @IsNotEmpty()
  @ArrayUnique()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  ticketIds: number[];

  @IsNotEmpty()
  @ApiProperty({ default: 1 })
  @Min(1)
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @ApiProperty({ default: 1 })
  @Min(1)
  @IsNumber()
  eventId: number;
}

export class IResponseReservationDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  userEmail: string;

  @ApiProperty()
  paymentStatus: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty({ isArray: true, type: IResponseTicketDto })
  tickets: IResponseTicketDto[];
}
