import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bono } from '../entities/bono.entity';
import { BonoClub } from '../entities/bono-club.entity';
import { CreateBonoDto } from './dto/create-bono.dto';

@Injectable()
export class BonosService {
  constructor(
    @InjectRepository(Bono)
    private bonoRepository: Repository<Bono>,
    @InjectRepository(BonoClub)
    private bonoClubRepository: Repository<BonoClub>,
  ) { }

  async findAll(user?: any): Promise<Bono[]> {
    if (user?.rol === 'superadmin') {
      return this.bonoRepository.find({
        where: { activo: true },
        relations: ['bonoClubes'],
      });
    }
    if (!user.idClub) {
      console.error('El usuario no tiene asignado un club');
      throw new ForbiddenException('El usuario no tiene asignado un club');
    }
    const bonoClubes = await this.bonoClubRepository.find({
      where: { clubId: user.idClub },
      relations: ['bono', 'bono.bonoClubes'],
    });
    return bonoClubes
      .map(bc => bc.bono)
      .filter(b => b.activo);
  }

  findOne(id: number): Promise<Bono | null> {
    return this.bonoRepository.findOne({
      where: { id },
      relations: ['bonoClubes'],
    });
  }

  create(createBonoDto: CreateBonoDto): Promise<Bono> {
    const bono = this.bonoRepository.create(createBonoDto);
    return this.bonoRepository.save(bono);
  }
}
