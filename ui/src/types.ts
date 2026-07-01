export type User = {
  firebaseUid: string;
  nombre: string;
  email: string;
  idClub: number | null;
  nombreClub?: string;
  rol: 'vendedor' | 'admin' | 'superadmin';
};

export type Venta = {
  id: number;
  bonoId: number;
  numero: number;
  clubId: number;
  compradorNombre: string;
  vendedorUid: string;
  vendedorNombre?: string;
  actividad?: string | null;
  tipoPago: 'contado' | 'transferencia' | 'cuotas';
  pagoVerificado: boolean;
  cuotas?: Cuota[];
  bono?: Bono;
  club?: Club;
  createdAt: string;
};

export type Cuota = {
  id: number;
  ventaId: number;
  numeroCuota: number;
  mes: number | null;
  pagada: boolean;
  fechaPago: string | null;
};

export type Bono = {
  id: number;
  nombre: string;
  anio: number;
  mesInicial: number;
  montoCuota: number;
  montoContado: number;
  cantidadCuotas: number;
  activo: boolean;
  bonoClubes?: BonoClub[];
};

export type Club = {
  id: number;
  nombre: string;
  urlEscudo?: string;
};

export type Sorteo = {
  id: number;
  bonoId: number;
  fechaSorteo: string;
  premio: string;
  mes: number;
  numeroGanador: number;
  idClubGanador: number | null;
  vendedorGanadorUid: string | null;
  ventaGanadoraId: number | null;
  bono?: Bono;
  club?: Club;
  venta?: Venta | null;
  createdAt: string;
};

export type BonoClub = {
  id: number;
  bonoId: number;
  clubId: number;
  rangoInicio: number;
  rangoFin: number;
  club?: Club;
};

export type ValidacionResultado = {
  status: 'vacante' | 'inhabilitado' | 'ganador';
  mensaje: string;
  venta?: Venta | null;
};
