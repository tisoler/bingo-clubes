import { Entity, Column, OneToMany } from 'typeorm';
import { Venta } from './venta.entity';
import { BonoClub } from './bono-club.entity';
import { BaseEntity } from './base.entity';

@Entity('clubes')
export class Club extends BaseEntity {
  @Column() nombre: string;
  @Column({ name: 'url_escudo', nullable: true }) urlEscudo: string;
  @Column({ default: true }) activo: boolean;
  @OneToMany(() => Venta, v => v.club) ventas: Venta[];
  @OneToMany(() => BonoClub, bc => bc.club) bonoClubes: BonoClub[];
}
