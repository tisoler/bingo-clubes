import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Club } from './entities/club.entity';
import { Bono } from './entities/bono.entity';
import { BonoClub } from './entities/bono-club.entity';
import { Venta } from './entities/venta.entity';
import { Cuota } from './entities/cuota.entity';
import { Sorteo } from './entities/sorteo.entity';
import { AuthModule } from './auth/auth.module';
import { ClubesModule } from './clubes/clubes.module';
import { BonosModule } from './bonos/bonos.module';
import { BonoClubModule } from './bono-club/bono-club.module';
import { VentasModule } from './ventas/ventas.module';
import { CuotasModule } from './cuotas/cuotas.module';
import { SorteosModule } from './sorteos/sorteos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [Club, Bono, BonoClub, Venta, Cuota, Sorteo],
        synchronize: false,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ClubesModule,
    BonosModule,
    BonoClubModule,
    VentasModule,
    CuotasModule,
    SorteosModule,
  ],
})
export class AppModule { }
