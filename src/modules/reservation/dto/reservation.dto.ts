import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, ArrayUnique, IsString } from "class-validator";

export class CreateReservationDto {
    @ApiProperty({ description: 'array of tickets Ids' })
    @IsNotEmpty()
    @ArrayUnique()
    @IsArray()
    @Type(() => Number)
    @IsNumber({}, { each: true })
    ticketIds: number[]

    @IsNotEmpty()
    @ApiProperty()
    @IsString()
    userEmail: string

}