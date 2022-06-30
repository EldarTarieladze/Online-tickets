import { ApiProperty } from '@nestjs/swagger';

export class IResponseCreateReservationDto {
  @ApiProperty()
  message: string;
}
