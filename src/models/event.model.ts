import { Column, DataType, HasMany, Model, Sequelize, Table } from 'sequelize-typescript';
import { Ticket } from './ticket.model';


@Table({tableName: 'events', freezeTableName: true, timestamps: true})
export class Events extends Model<Events> {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  eventName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  description: string;

  @HasMany(() => Ticket)
  tickets: Ticket[]

}