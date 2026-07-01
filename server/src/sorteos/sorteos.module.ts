import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SorteosController } from './sorteos.controller';
import { SorteosService } from './sorteos.service';
import { Sorteo } from '../entities/sorteo.entity';
import { Venta } from '../entities/venta.entity';
import { Bono } from '../entities/bono.entity';
import { Cuota } from '../entities/cuota.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sorteo, Venta, Bono, Cuota])],
  controllers: [SorteosController],
  providers: [SorteosService],
})
export class SorteosModule {}
