import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from '../entities/venta.entity';
import { Cuota } from '../entities/cuota.entity';
import { BonoClub } from '../entities/bono-club.entity';
import { Bono } from '../entities/bono.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { VentasFilterDto } from './dto/ventas-filter.dto';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventaRepository: Repository<Venta>,
    @InjectRepository(Cuota)
    private cuotaRepository: Repository<Cuota>,
    @InjectRepository(Bono)
    private bonoRepository: Repository<Bono>,
    @InjectRepository(BonoClub)
    private bonoClubRepository: Repository<BonoClub>,
  ) { }

  async create(createVentaDto: CreateVentaDto, user: any): Promise<Venta> {
    const bono = await this.bonoRepository.findOneBy({ id: createVentaDto.bonoId, activo: true });
    if (!bono) {
      throw new BadRequestException('Bono activo no encontrado');
    }

    if (createVentaDto.numero < 0 || createVentaDto.numero > 499) {
      throw new BadRequestException('El número debe estar entre 0 y 499');
    }

    const bonoClub = await this.bonoClubRepository.findOneBy({
      bonoId: createVentaDto.bonoId,
      clubId: createVentaDto.clubId,
    });
    if (!bonoClub) {
      throw new BadRequestException('El club no está asignado a este bono');
    }
    if (createVentaDto.numero < bonoClub.rangoInicio || createVentaDto.numero > bonoClub.rangoFin) {
      throw new BadRequestException(
        `El número debe estar entre ${bonoClub.rangoInicio} y ${bonoClub.rangoFin} para este club`,
      );
    }

    const existing = await this.ventaRepository.findOneBy({
      bonoId: createVentaDto.bonoId,
      numero: createVentaDto.numero,
    });
    if (existing) {
      throw new BadRequestException('El número ya está vendido para este bono');
    }

    const cantidadCuotas = createVentaDto.tipoPago === 'cuotas'
      ? (createVentaDto.cantidadCuotas || 1)
      : 0;

    const venta = this.ventaRepository.create({
      bonoId: createVentaDto.bonoId,
      numero: createVentaDto.numero,
      clubId: createVentaDto.clubId,
      compradorNombre: createVentaDto.compradorNombre,

      vendedorUid: user.firebaseUid || user.uid,
      vendedorNombre: user.nombre || '',
      actividad: user.actividad || null,
      tipoPago: createVentaDto.tipoPago,
      cantidadCuotas,
      pagoVerificado: false,
    });

    const saved = await this.ventaRepository.save(venta);

    if (createVentaDto.tipoPago === 'cuotas' && cantidadCuotas > 0) {
      const cuotas = [];
      for (let i = 1; i <= cantidadCuotas; i++) {
        const mes = ((bono.mesInicial + i - 2) % 12) + 1;
        cuotas.push(
          this.cuotaRepository.create({
            ventaId: saved.id,
            numeroCuota: i,
            mes,
            pagada: false,
          }),
        );
      }
      await this.cuotaRepository.save(cuotas);
    }

    return this.ventaRepository.findOne({
      where: { id: saved.id },
      relations: ['cuotas', 'bono', 'club'],
    });
  }

  findAll(filter: VentasFilterDto, user: any): Promise<Venta[]> {
    if (user?.rol !== 'superadmin' && !user.idClub) {
      console.error('El usuario no tiene asignado un club');
      throw new ForbiddenException('El usuario no tiene asignado un club');
    }

    const query = this.ventaRepository.createQueryBuilder('venta')
      .leftJoinAndSelect('venta.bono', 'bono')
      .leftJoinAndSelect('venta.club', 'club')
      .leftJoinAndSelect('venta.cuotas', 'cuotas');

    if (filter.bonoId) {
      query.andWhere('venta.bono_id = :bonoId', { bonoId: filter.bonoId });
    }
    if (user.rol === 'superadmin') {
      if (filter.clubId) {
        query.andWhere('venta.club_id = :clubId', { clubId: filter.clubId });
      }
    } else {
      query.andWhere('venta.club_id = :clubId', { clubId: user.idClub });
    }
    if (filter.tipoPago) {
      query.andWhere('venta.tipo_pago = :tipoPago', { tipoPago: filter.tipoPago });
    }
    if (filter.pagoVerificado !== undefined) {
      query.andWhere('venta.pago_verificado = :pagoVerificado', { pagoVerificado: filter.pagoVerificado });
    }
    if (filter.search) {
      query.andWhere(
        '(venta.comprador_nombre ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    return query.orderBy('venta.created_at', 'DESC').getMany();
  }

  async verificarPago(id: number): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ['cuotas'],
    });
    if (!venta) {
      throw new BadRequestException('Venta no encontrada');
    }
    venta.pagoVerificado = !venta.pagoVerificado;
    return this.ventaRepository.save(venta);
  }

  async getDisponibles(bonoId: number, clubId: number): Promise<number[]> {
    const bonoClub = await this.bonoClubRepository.findOneBy({ bonoId, clubId });
    if (!bonoClub) {
      throw new BadRequestException('El club no está asignado a este bono');
    }

    const vendidos = await this.ventaRepository.find({
      where: { bonoId, clubId },
      select: ['numero'],
    });

    const numerosVendidos = new Set(vendidos.map(v => v.numero));
    const disponibles: number[] = [];

    for (let i = bonoClub.rangoInicio; i <= bonoClub.rangoFin; i++) {
      if (!numerosVendidos.has(i)) {
        disponibles.push(i);
      }
    }

    return disponibles;
  }

  async getVendidos(bonoId: number, clubId: number): Promise<Venta[]> {
    return this.ventaRepository.find({
      where: { bonoId, clubId },
      relations: ['bono', 'club'],
    });
  }
}
