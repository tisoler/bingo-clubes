import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Venta } from './venta.entity';

@Entity('cuotas')
export class Cuota extends BaseEntity {
  @Column({ name: 'venta_id' }) ventaId: number;
  @Column({ name: 'numero_cuota' }) numeroCuota: number;
  @Column({ nullable: true }) mes: number;
  @Column({ default: false }) pagada: boolean;
  @Column({ name: 'fecha_pago', nullable: true, type: 'date' }) fechaPago: Date;
  @ManyToOne(() => Venta, v => v.cuotas)
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;
}
