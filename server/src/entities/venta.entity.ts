import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Bono } from './bono.entity';
import { Club } from './club.entity';
import { Cuota } from './cuota.entity';

@Entity('ventas')
export class Venta extends BaseEntity {
  @Column({ name: 'bono_id' }) bonoId: number;
  @Column() numero: number;
  @Column({ name: 'club_id' }) clubId: number;
  @Column({ name: 'comprador_nombre' }) compradorNombre: string;

  @Column({ name: 'vendedor_uid' }) vendedorUid: string;
  @Column({ name: 'vendedor_nombre' }) vendedorNombre: string;
  @Column({ name: 'actividad', nullable: true }) actividad: string | null;
  @Column({ name: 'tipo_pago', default: 'contado' }) tipoPago: string;
  @Column({ name: 'cantidad_cuotas', default: 1 }) cantidadCuotas: number;
  @Column({ name: 'pago_verificado', default: false }) pagoVerificado: boolean;
  @ManyToOne(() => Bono, b => b.ventas)
  @JoinColumn({ name: 'bono_id' })
  bono: Bono;
  @ManyToOne(() => Club, c => c.ventas)
  @JoinColumn({ name: 'club_id' })
  club: Club;
  @OneToMany(() => Cuota, c => c.venta)
  cuotas: Cuota[];
}
