import { ApiProperty } from '@nestjs/swagger';
import { Ticket } from 'src/models/ticket.model';
import { IResponseTicketDto } from 'src/modules/ticket/dto/ticket.dto';

export class IResponseEventWithTicketsDto extends Ticket {
  @ApiProperty()
  id: number;

  @ApiProperty()
  eventName: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty({ isArray: true, type: IResponseTicketDto })
  tickets: IResponseTicketDto[];
}
