import { BelongsTo, Column, DataType, ForeignKey, Model,  Table } from 'sequelize-typescript';
import { Events } from './event.model';
import { Reservation } from './reservation.model';

@Table({ tableName: 'tickets',timestamps: true })
export class Ticket extends Model<Ticket> {

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  rowNumber: number

  @Column({
    type: DataType.ARRAY(DataType.ENUM({values: ['AVOID_ONE', 'ALL_TOGETHER', 'EVEN']})),
    allowNull: false
  })
  sellingOptions: string[];

  @ForeignKey(() => Events)
  @Column({type: DataType.INTEGER})
  eventId: number

  @BelongsTo(() => Events)
  event: Events

  @ForeignKey(() => Reservation)
  @Column({type: DataType.INTEGER})
  reservationId: number

  @BelongsTo(() => Reservation)
  reservation: Reservation

}