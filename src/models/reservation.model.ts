import {
  Column,
  DataType,
  HasMany,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { Ticket } from './ticket.model';

@Table({ tableName: 'reservations', freezeTableName: true, timestamps: true, underscored: true })
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
    values: ['NOT_PAID', 'PROCESS', 'PAID', 'FAILED'],
    defaultValue: 'NOT_PAID',
  })
  paymentStatus: string;

  @HasMany(() => Ticket, { onDelete: 'SET NULL' })
  tickets: Ticket[];

}
