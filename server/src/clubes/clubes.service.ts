import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from '../entities/club.entity';

@Injectable()
export class ClubesService {
  constructor(
    @InjectRepository(Club)
    private clubRepository: Repository<Club>,
  ) {}

  findAll(): Promise<Club[]> {
    return this.clubRepository.find({ where: { activo: true } });
  }

  findOne(id: number): Promise<Club | null> {
    return this.clubRepository.findOne({ where: { id } });
  }
}
