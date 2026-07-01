import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BonosController } from './bonos.controller';
import { BonosService } from './bonos.service';
import { Bono } from '../entities/bono.entity';
import { BonoClub } from '../entities/bono-club.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bono, BonoClub])],
  controllers: [BonosController],
  providers: [BonosService],
})
export class BonosModule {}
