import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Bono } from './bono.entity';
import { Club } from './club.entity';
import { Venta } from './venta.entity';

@Entity('sorteos')
export class Sorteo extends BaseEntity {
  @Column({ name: 'bono_id' }) bonoId: number;
  @Column({ name: 'fecha_sorteo', type: 'date' }) fechaSorteo: Date;
  @Column() premio: string;
  @Column() mes: number;
  @Column({ name: 'numero_ganador', nullable: true }) numeroGanador: number;
  @Column({ name: 'id_club_ganador', nullable: true }) idClubGanador: number;
  @Column({ name: 'vendedor_ganador_uid', nullable: true }) vendedorGanadorUid: string;
  @Column({ name: 'venta_ganadora_id', nullable: true }) ventaGanadoraId: number;
  @ManyToOne(() => Bono)
  @JoinColumn({ name: 'bono_id' })
  bono: Bono;
  @ManyToOne(() => Club)
  @JoinColumn({ name: 'id_club_ganador' })
  club: Club;
  @ManyToOne(() => Venta)
  @JoinColumn({ name: 'venta_ganadora_id' })
  venta: Venta;
}
