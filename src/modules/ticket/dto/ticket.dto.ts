import { ApiProperty } from '@nestjs/swagger';
import { Ticket } from 'src/models/ticket.model';

export class IResponseTicketDto extends Ticket {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  rowNumber: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  sellingOptions: string[];

  @ApiProperty()
  eventId: number;

  @ApiProperty()
  reservationId: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
