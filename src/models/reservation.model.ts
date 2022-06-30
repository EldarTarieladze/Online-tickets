import {
  Column,
  DataType,
  HasMany,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { Ticket } from './ticket.model';

@Table({ tableName: 'reservations', freezeTableName: true, timestamps: true })
export class Reservation extends Model<Reservation> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @Column({
    type: DataType.ENUM,
    values: ['NOT_PAID', 'PROGRESS', 'PAID'],
    defaultValue: 'NOT_PAID',
  })
  paymentStatus: string;

  @HasMany(() => Ticket)
  tickets: Ticket[];
}
