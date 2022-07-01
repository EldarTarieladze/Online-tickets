import { exec } from 'child_process';
import { Sequelize } from 'sequelize-typescript';
import { Events } from 'src/models/event.model';
import { Reservation } from 'src/models/reservation.model';
import { Ticket } from 'src/models/ticket.model';
import { SEQUELIZE, DEVELOPMENT, TEST, PRODUCTION } from '../constants';
import { databaseConfig } from './database.config';
import { IDatabaseConfigAttributes } from './interfaces/dbConfig.interface';

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async () => {
      let config: IDatabaseConfigAttributes;
      switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
          config = databaseConfig.development;
          break;
        case TEST:
          config = databaseConfig.test;
          break;
        case PRODUCTION:
          config = databaseConfig.production;
          break;
        default:
          config = databaseConfig.development;
      }
      const sequelize = new Sequelize(config as any);
      sequelize.addModels([Ticket, Events, Reservation]);
      if (process.env.AUTO_SYNC_DB === 'true') {
        await sequelize.sync({ force: true }).then(() => {
          exec('npx sequelize db:seed:all', (err) => {
            if (err) console.error(err);
          });
        });
      }
      return sequelize;
    },
  },
];
