import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sorteo } from '../entities/sorteo.entity';
import { Venta } from '../entities/venta.entity';
import { Bono } from '../entities/bono.entity';
import { Cuota } from '../entities/cuota.entity';
import { CreateSorteoDto } from './dto/create-sorteo.dto';

export type ValidacionResultado = {
  status: 'vacante' | 'inhabilitado' | 'ganador';
  mensaje: string;
  venta?: Venta;
};

@Injectable()
export class SorteosService {
  constructor(
    @InjectRepository(Sorteo)
    private sorteoRepository: Repository<Sorteo>,
    @InjectRepository(Venta)
    private ventaRepository: Repository<Venta>,
    @InjectRepository(Bono)
    private bonoRepository: Repository<Bono>,
    @InjectRepository(Cuota)
    private cuotaRepository: Repository<Cuota>,
  ) {}

  async validar(bonoId: number, numero: number, mes: number): Promise<ValidacionResultado> {
    const baseNumero = numero >= 500 ? numero - 500 : numero;

    const bono = await this.bonoRepository.findOneBy({ id: bonoId });
    if (!bono) {
      throw new BadRequestException('Bono no encontrado');
    }

    const venta = await this.ventaRepository.findOne({
      where: { bonoId, numero: baseNumero },
      relations: ['club', 'cuotas', 'bono'],
    });

    if (!venta) {
      return { status: 'vacante', mensaje: 'Vacante — el número no fue vendido' };
    }

    if (venta.tipoPago === 'contado' || venta.tipoPago === 'transferencia') {
      if (venta.pagoVerificado) {
        return { status: 'ganador', mensaje: 'Ganador confirmado', venta };
      }
      return { status: 'inhabilitado', mensaje: 'Vacante / inhabilitado para sorteo — pago no verificado', venta };
    }

    if (venta.tipoPago === 'cuotas') {
      const cuotaDelMes = venta.cuotas?.find(c => c.mes === mes);
      if (cuotaDelMes?.pagada) {
        return { status: 'ganador', mensaje: 'Ganador confirmado', venta };
      }
      return { status: 'inhabilitado', mensaje: 'Vacante / inhabilitado para sorteo — cuota del mes no pagada', venta };
    }

    return { status: 'inhabilitado', mensaje: 'Vacante / inhabilitado para sorteo', venta };
  }

  async create(createSorteoDto: CreateSorteoDto): Promise<Sorteo> {
    const validacion = await this.validar(createSorteoDto.bonoId, createSorteoDto.numeroGanador, createSorteoDto.mes);

    if (validacion.status !== 'ganador') {
      throw new BadRequestException(validacion.mensaje);
    }

    const venta = validacion.venta!;
    const sorteo = this.sorteoRepository.create({
      bonoId: createSorteoDto.bonoId,
      fechaSorteo: new Date(createSorteoDto.fechaSorteo),
      premio: createSorteoDto.premio,
      mes: createSorteoDto.mes,
      numeroGanador: createSorteoDto.numeroGanador,
      idClubGanador: venta.clubId,
      vendedorGanadorUid: venta.vendedorUid,
      ventaGanadoraId: venta.id,
    });

    const saved = await this.sorteoRepository.save(sorteo);
    return this.sorteoRepository.findOne({
      where: { id: saved.id },
      relations: ['bono', 'club', 'venta', 'venta.club'],
    }) as Promise<Sorteo>;
  }

  findAll(): Promise<Sorteo[]> {
    return this.sorteoRepository.find({
      relations: ['bono', 'club', 'venta', 'venta.club'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Sorteo> {
    const sorteo = await this.sorteoRepository.findOne({
      where: { id },
      relations: ['bono', 'club', 'venta', 'venta.club'],
    });
    if (!sorteo) {
      throw new NotFoundException('Sorteo no encontrado');
    }
    return sorteo;
  }
}
