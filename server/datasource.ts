import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Club } from './src/entities/club.entity';
import { Bono } from './src/entities/bono.entity';
import { BonoClub } from './src/entities/bono-club.entity';
import { Venta } from './src/entities/venta.entity';
import { Cuota } from './src/entities/cuota.entity';
import { Sorteo } from './src/entities/sorteo.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Club, Bono, BonoClub, Venta, Cuota, Sorteo],
  migrations: ['./dist/migrations/*.js'],
  synchronize: false,
});
