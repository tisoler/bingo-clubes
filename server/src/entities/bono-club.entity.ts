import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Bono } from './bono.entity';
import { Club } from './club.entity';

@Entity('bono_club')
export class BonoClub extends BaseEntity {
  @Column({ name: 'bono_id' }) bonoId: number;
  @Column({ name: 'club_id' }) clubId: number;
  @Column({ name: 'rango_inicio' }) rangoInicio: number;
  @Column({ name: 'rango_fin' }) rangoFin: number;
  @ManyToOne(() => Bono, b => b.bonoClubes)
  @JoinColumn({ name: 'bono_id' })
  bono: Bono;
  @ManyToOne(() => Club, c => c.bonoClubes)
  @JoinColumn({ name: 'club_id' })
  club: Club;
}
