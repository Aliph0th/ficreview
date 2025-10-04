import { Umzug, SequelizeStorage } from 'umzug';
import { Sequelize, Options } from 'sequelize';
import path from 'path';

const sequelize = new Sequelize({
   dialect: 'postgres',
   host: process.env.POSTGRES_HOST,
   port: +(process.env.POSTGRES_PORT || 5432),
   username: process.env.POSTGRES_USER,
   password: process.env.POSTGRES_PASSWORD,
   database: process.env.POSTGRES_DATABASE
} as Options);

export const migrator = new Umzug({
   migrations: {
      // Read migrations from the repository root `migrations` folder
      glob: path.join(process.cwd(), 'migrations', '*.{ts,js}')
   },
   context: sequelize,
   storage: new SequelizeStorage({
      sequelize,
      tableName: 'migrations'
   }),
   logger: console
});

export type Migration = typeof migrator._types.migration;
