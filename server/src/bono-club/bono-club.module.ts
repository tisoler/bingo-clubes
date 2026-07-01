import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BonoClubController } from './bono-club.controller';
import { BonoClubService } from './bono-club.service';
import { BonoClub } from '../entities/bono-club.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BonoClub])],
  controllers: [BonoClubController],
  providers: [BonoClubService],
})
export class BonoClubModule {}
