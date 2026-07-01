import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cuota } from '../entities/cuota.entity';
import { Venta } from '../entities/venta.entity';
import { PagarCuotaDto } from './dto/pagar-cuota.dto';

@Injectable()
export class CuotasService {
  constructor(
    @InjectRepository(Cuota)
    private cuotaRepository: Repository<Cuota>,
    @InjectRepository(Venta)
    private ventaRepository: Repository<Venta>,
  ) {}

  async findByVenta(ventaId: number): Promise<Cuota[]> {
    return this.cuotaRepository.find({
      where: { ventaId },
      order: { numeroCuota: 'ASC' },
    });
  }

  async pagar(id: number, pagarCuotaDto: PagarCuotaDto): Promise<Cuota> {
    const cuota = await this.cuotaRepository.findOneBy({ id });
    if (!cuota) {
      throw new BadRequestException('Cuota no encontrada');
    }
    cuota.pagada = pagarCuotaDto.pagada ?? true;
    if (pagarCuotaDto.fechaPago) {
      cuota.fechaPago = new Date(pagarCuotaDto.fechaPago);
    } else if (cuota.pagada) {
      cuota.fechaPago = new Date();
    } else {
      cuota.fechaPago = null;
    }
    return this.cuotaRepository.save(cuota);
  }
}
