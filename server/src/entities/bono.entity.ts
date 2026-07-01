import { Entity, Column, OneToMany } from 'typeorm';
import { Venta } from './venta.entity';
import { BonoClub } from './bono-club.entity';
import { BaseEntity } from './base.entity';

@Entity('bonos')
export class Bono extends BaseEntity {
  @Column() nombre: string;
  @Column() anio: number;
  @Column({ name: 'mes_inicial' }) mesInicial: number;
  @Column({ name: 'monto_cuota', type: 'decimal', precision: 10, scale: 2 }) montoCuota: number;
  @Column({ name: 'monto_contado', type: 'decimal', precision: 10, scale: 2 }) montoContado: number;
  @Column({ name: 'cantidad_cuotas', default: 6 }) cantidadCuotas: number;
  @Column({ default: true }) activo: boolean;
  @OneToMany(() => Venta, v => v.bono) ventas: Venta[];
  @OneToMany(() => BonoClub, bc => bc.bono) bonoClubes: BonoClub[];
}
