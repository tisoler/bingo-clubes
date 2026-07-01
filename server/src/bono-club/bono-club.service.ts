import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BonoClub } from '../entities/bono-club.entity';

@Injectable()
export class BonoClubService {
  constructor(
    @InjectRepository(BonoClub)
    private bonoClubRepository: Repository<BonoClub>,
  ) {}

  findByBono(bonoId: number): Promise<BonoClub[]> {
    return this.bonoClubRepository.find({
      where: { bonoId },
      relations: ['club'],
    });
  }

  findOne(bonoId: number, clubId: number): Promise<BonoClub | null> {
    return this.bonoClubRepository.findOne({
      where: { bonoId, clubId },
      relations: ['club'],
    });
  }
}
