import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuotasController } from './cuotas.controller';
import { CuotasService } from './cuotas.service';
import { Cuota } from '../entities/cuota.entity';
import { Venta } from '../entities/venta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cuota, Venta])],
  controllers: [CuotasController],
  providers: [CuotasService],
})
export class CuotasModule {}
