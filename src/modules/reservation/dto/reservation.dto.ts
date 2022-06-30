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
  @ApiProperty({ description: 'array of tickets Ids' })
  @IsNotEmpty()
  @ArrayUnique()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  ticketIds: number[];

  @IsNotEmpty()
  @ApiProperty()
  @Min(1)
  @IsNumber()
  userId: number;
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
