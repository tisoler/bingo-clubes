import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';
import { Venta } from '../entities/venta.entity';
import { Cuota } from '../entities/cuota.entity';
import { Club } from '../entities/club.entity';
import { Bono } from '../entities/bono.entity';
import { BonoClub } from '../entities/bono-club.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Venta, Cuota, Club, Bono, BonoClub])],
  controllers: [VentasController],
  providers: [VentasService],
})
export class VentasModule {}
