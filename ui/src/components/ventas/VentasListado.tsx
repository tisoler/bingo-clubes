import { useState, useEffect, useMemo, Fragment } from 'react';
import api from '../../lib/api';
import type { Venta, Cuota, Club, Bono } from '../../types';

const MAX_CUOTAS_FALLBACK = 5;
const ITEMS_PER_PAGE = 10;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPair(num: number) {
  return `${String(num).padStart(3, '0')}/${String(num + 500).padStart(3, '0')}`;
}

function getCuotaDelMesEnCurso(venta: Venta): Cuota | undefined {
  if (venta.tipoPago !== 'cuotas' || !venta.cuotas?.length) return undefined;
  const currentMonth = new Date().getMonth() + 1;
  const byMes = venta.cuotas.find(c => c.mes === currentMonth);
  if (byMes) return byMes;
  if (venta.bono?.mesInicial != null) {
    const idx = currentMonth - venta.bono.mesInicial;
    if (idx >= 0 && idx < venta.cuotas.length) return venta.cuotas[idx];
  }
  return undefined;
}

function getVerificado(venta: Venta): boolean {
  if (venta.tipoPago === 'cuotas') return !!getCuotaDelMesEnCurso(venta)?.pagada;
  return venta.pagoVerificado;
}

function getMontoTotal(venta: Venta): number {
  if (!venta.bono) return 0;
  if (venta.tipoPago === 'cuotas') return Number(venta.bono.montoCuota) * venta.bono.cantidadCuotas;
  return Number(venta.bono.montoContado);
}

function getCuotaMonto(venta: Venta): number {
  if (!venta.bono || !venta.bono.cantidadCuotas) return 0;
  return Number(venta.bono.montoCuota);
}

interface VentasListadoProps {
  title: string;
  ventas: Venta[];
  setVentas: React.Dispatch<React.SetStateAction<Venta[]>>;
  loading: boolean;
  showSuperadminClubCol?: boolean;
  clubes?: Club[];
  showVendedorCol?: boolean;
  showActividadCol?: boolean;
  canToggle?: boolean;
}

export default function VentasListado({
  title,
  ventas,
  setVentas,
  loading,
  showSuperadminClubCol = false,
  clubes = [],
  showVendedorCol = false,
  showActividadCol = false,
  canToggle = true,
}: VentasListadoProps) {
  const [search, setSearch] = useState('');
  const [filtroTipoPago, setFiltroTipoPago] = useState('');
  const [filtroVerificado, setFiltroVerificado] = useState('');
  const [filtroClub, setFiltroClub] = useState('');
  const [filtroActividad, setFiltroActividad] = useState('');
  const [expandedVenta, setExpandedVenta] = useState<number | null>(null);
  const [updatingRows, setUpdatingRows] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(1);
  const [bonos, setBonos] = useState<Bono[]>([]);
  const [selectedBono, setSelectedBono] = useState<Bono | null>(null);

  const totalCols = 8 + (showSuperadminClubCol ? 1 : 0) + (showActividadCol ? 1 : 0);

  const loadBonos = async () => {
    try {
      const res = await api.get('/bonos');
      setBonos(res.data.filter((b: Bono) => b.activo));
    } catch (err) {
      console.error('Error al cargar bonos:', err);
    }
  };

  useEffect(() => {
    loadBonos();
  }, []);

  useEffect(() => {
    if (bonos.length > 0 && !selectedBono) {
      setSelectedBono(bonos[0]);
    }
  }, [bonos, selectedBono]);

  const handleToggleVerificado = async (venta: Venta) => {
    setUpdatingRows(prev => ({ ...prev, [venta.id]: true }));
    try {
      await api.patch(`/ventas/${venta.id}/verificar-pago`);
      setVentas(prev =>
        prev.map(v => v.id === venta.id ? { ...v, pagoVerificado: !v.pagoVerificado } : v)
      );
    } catch (err) {
      console.error('Error al actualizar verificación:', err);
    } finally {
      setUpdatingRows(prev => ({ ...prev, [venta.id]: false }));
    }
  };

  const handleToggleCuota = async (cuota: Cuota, ventaId: number) => {
    setUpdatingRows(prev => ({ ...prev, [ventaId]: true }));
    try {
      await api.patch(`/cuotas/${cuota.id}/pagar`, {
        pagada: !cuota.pagada,
      });
      setVentas(prev =>
        prev.map(v => {
          if (v.id !== ventaId) return v;
          return {
            ...v,
            cuotas: v.cuotas?.map(c =>
              c.id === cuota.id ? { ...c, pagada: !c.pagada, fechaPago: !c.pagada ? new Date().toISOString() : null } : c
            ),
          };
        })
      );
    } catch (err) {
      console.error('Error al actualizar cuota:', err);
    } finally {
      setUpdatingRows(prev => ({ ...prev, [ventaId]: false }));
    }
  };

  const getClubNombre = (clubId: number) => {
    return clubes.find(c => c.id === clubId)?.nombre || `Club #${clubId}`;
  };

  const ventasFiltradas = useMemo(() => {
    return ventas.filter(v => {
      if (search) {
        const q = search.toLowerCase();
        const matchNombre = v.compradorNombre.toLowerCase().includes(q);
        const matchNumero = String(v.numero).includes(q) || String(v.numero + 500).includes(q);
        const matchVendedor = showVendedorCol ? v.vendedorNombre?.toLowerCase().includes(q) : false;
        if (!matchNombre && !matchNumero && !matchVendedor) return false;
      }
      if (filtroTipoPago && v.tipoPago !== filtroTipoPago) return false;
      if (filtroVerificado === 'verificado' && !getVerificado(v)) return false;
      if (filtroVerificado === 'no-verificado' && getVerificado(v)) return false;
      if (showSuperadminClubCol && filtroClub && v.clubId !== Number(filtroClub)) return false;
      if (filtroActividad && (v.actividad || '') !== filtroActividad) return false;
      return true;
    });
  }, [ventas, search, filtroTipoPago, filtroVerificado, filtroClub, filtroActividad, showSuperadminClubCol, showVendedorCol, showActividadCol]);

  const totalPages = Math.max(1, Math.ceil(ventasFiltradas.length / ITEMS_PER_PAGE));
  const paginatedVentas = ventasFiltradas.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const totalVendido = useMemo(
    () => ventas.reduce((sum, v) => {
      if (v.tipoPago !== 'cuotas') return sum + getMontoTotal(v);
      if (v.tipoPago === 'cuotas' && v.bono) {
        return sum + v.bono.cantidadCuotas * v.bono.montoCuota;
      }
      return sum;
    }, 0),
    [ventas]
  );

  const totalRecaudado = useMemo(
    () => ventas.reduce((sum, v) => {
      if (v.tipoPago !== 'cuotas' && v.pagoVerificado) return sum + getMontoTotal(v);
      if (v.tipoPago === 'cuotas' && v.cuotas) {
        const montoCuota = getCuotaMonto(v);
        return sum + v.cuotas.filter(c => c.pagada).length * montoCuota;
      }
      return sum;
    }, 0),
    [ventas]
  );

  const totalPendiente = useMemo(
    () => ventas.reduce((sum, v) => {
      if (v.tipoPago !== 'cuotas' && !v.pagoVerificado) return sum + getMontoTotal(v);
      if (v.tipoPago === 'cuotas' && v.cuotas && v.bono) {
        const montoCuota = getCuotaMonto(v);
        const pendientes = v.cuotas.filter(c => !c.pagada).length;
        return sum + pendientes * montoCuota;
      }
      return sum;
    }, 0),
    [ventas]
  );

  const clearFilters = () => {
    setSearch('');
    setFiltroTipoPago('');
    setFiltroVerificado('');
    setFiltroClub('');
    setFiltroActividad('');
    setPage(1);
  };

  const hasActiveFilters = search || filtroTipoPago || filtroVerificado || filtroClub || filtroActividad;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-2xl text-primary">receipt_long</span>
        <h2 className="font-headline-lg text-headline-lg text-primary">{title}</h2>
      </div>

      {/* Summary Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-outline-variant p-5 md:p-6 rounded-xl flex items-center justify-between group hover:border-primary transition-colors">
          <div>
            <p className="text-on-surface-variant text-body-sm font-semibold">Total Bonos Vendidos</p>
            <h3 className="font-headline-lg text-headline-lg text-primary mt-1">
              {ventas.length.toLocaleString('es-AR')}
            </h3>
            <p className="text-[#1a5e1a] text-xs font-bold flex items-center gap-1 mt-2">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              Vendidos
            </p>
          </div>
          <div className="w-15 h-18 flex items-center justify-center bg-primary-container/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
            <span style={{ fontSize: '2.1rem' }} className="material-symbols-outlined font-bold">shopping_cart</span>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant p-5 md:p-6 rounded-xl flex items-center justify-between group hover:border-primary transition-colors">
          <div>
            <p className="text-on-surface-variant text-body-sm font-semibold">Total Vendido</p>
            <h3 className="font-headline-lg text-headline-lg text-primary mt-1 font-bold">
              ${totalVendido.toLocaleString('es-AR')}
            </h3>
            <p className="text-primary text-xs font-bold flex items-center gap-1 mt-2">
              <span className="material-symbols-outlined text-sm">payments</span>
              Vendido
            </p>
          </div>
          <div className="w-15 h-18 flex items-center justify-center bg-primary/20 rounded-xl text-primary group-hover:bg-secondary group-hover:text-on-secondary transition-all flex items-center">
            <span style={{ fontSize: '2.1rem' }} className="material-symbols-outlined font-bold">sell</span>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant p-5 md:p-6 rounded-xl flex items-center justify-between group hover:border-primary transition-colors">
          <div>
            <p className="text-on-surface-variant text-body-sm font-semibold">Total Recaudado</p>
            <h3 className="font-headline-lg text-headline-lg text-[#1a5e1a] mt-1 font-bold">
              ${totalRecaudado.toLocaleString('es-AR')}
            </h3>
            {totalRecaudado > 0 && (
              <div className="w-full bg-surface-variant h-1.5 rounded-full mt-3">
                <div
                  className="bg-[#1a5e1a] h-1.5 rounded-full transition-all"
                  style={{ width: `${(totalRecaudado / totalVendido) * 100}%` }}
                />
              </div>
            )}
          </div>
          <div className="w-15 h-18 flex items-center justify-center bg-[#1a5e1a]/20 rounded-xl text-[#1a5e1a] group-hover:bg-[#1a5e1a] group-hover:text-on-secondary transition-all flex items-center">
            <span style={{ fontSize: '2.1rem' }} className="material-symbols-outlined font-bold">account_balance</span>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant p-5 md:p-6 rounded-xl flex items-center justify-between group hover:border-primary transition-colors">
          <div>
            <p className="text-on-surface-variant text-body-sm font-bold">Pendiente de Cobro</p>
            <h3 className="font-headline-lg text-headline-lg text-[#93000a] mt-1 font-bold">
              ${totalPendiente.toLocaleString('es-AR')}
            </h3>
            {totalRecaudado + totalPendiente > 0 && (
              <div className="w-full bg-surface-variant h-1.5 rounded-full mt-3">
                <div
                  className="bg-[#93000a] h-1.5 rounded-full transition-all"
                  style={{ width: `${(totalPendiente / (totalRecaudado + totalPendiente)) * 100}%` }}
                />
              </div>
            )}
          </div>
          <div className="w-15 h-18 flex items-center justify-center bg-error-container/30 rounded-xl text-error group-hover:bg-error group-hover:text-on-error transition-all flex items-center">
            <span style={{ fontSize: '2.1rem' }} className="material-symbols-outlined font-bold">pending_actions</span>
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="bg-surface-container-low p-4 rounded-xl flex flex-wrap items-center gap-3 border border-outline-variant">
        <div className="flex items-center gap-2 text-primary font-bold mr-2">
          <span className="material-symbols-outlined">filter_list</span>
          <span className="font-body-base text-body-sm hidden sm:inline">Filtros Rápidos</span>
        </div>

        {showVendedorCol && (
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre o número..."
            className="bg-surface border border-outline-variant rounded-lg px-4 py-2 text-body-sm min-w-[160px] flex-1 focus:ring-2 focus:ring-primary/20 outline-none"
          />
        )}
        {!showVendedorCol && (
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre o número..."
            className="bg-surface border border-outline-variant rounded-lg px-4 py-2 text-body-sm min-w-[160px] flex-1 focus:ring-2 focus:ring-primary/20 outline-none"
          />
        )}

        <select
          value={filtroTipoPago}
          onChange={(e) => { setFiltroTipoPago(e.target.value); setPage(1); }}
          className="bg-surface border border-outline-variant rounded-lg px-4 py-2 text-body-sm outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Tipo de Pago: todos</option>
          <option value="contado">Contado</option>
          <option value="transferencia">Transferencia</option>
          <option value="cuotas">Cuotas</option>
        </select>

        <select
          value={filtroVerificado}
          onChange={(e) => { setFiltroVerificado(e.target.value); setPage(1); }}
          className="bg-surface border border-outline-variant rounded-lg px-4 py-2 text-body-sm outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Estado: Todos</option>
          <option value="verificado">Verificado</option>
          <option value="no-verificado">No verificado</option>
        </select>

        {showSuperadminClubCol && (
          <select
            value={filtroClub}
            onChange={(e) => { setFiltroClub(e.target.value); setPage(1); }}
            className="bg-surface border border-outline-variant rounded-lg px-4 py-2 text-body-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Todos los clubes</option>
            {clubes.map((club) => (
              <option key={club.id} value={club.id}>{club.nombre}</option>
            ))}
          </select>
        )}

        {showActividadCol && (
          <select
            value={filtroActividad}
            onChange={(e) => { setFiltroActividad(e.target.value); setPage(1); }}
            className="bg-surface border border-outline-variant rounded-lg px-4 py-2 text-body-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Actividad: Todas</option>
            {Array.from(new Set(ventas.map(v => v.actividad).filter(Boolean))).sort().map((act) => (
              <option key={act} value={act!}>{(act || 'Sin actividad').charAt(0).toUpperCase() + (act || 'Sin actividad').slice(1)}</option>
            ))}
          </select>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto text-primary text-body-sm font-bold flex items-center gap-1 hover:underline"
          >
            <span className="material-symbols-outlined text-sm">close</span>
            Limpiar filtros
          </button>
        )}
      </section>

      {/* Data Table — desktop */}
      <section className="hidden md:block bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline-variant">
                <th className="p-[0.75rem_1rem] font-table-header text-table-header text-on-surface-variant uppercase tracking-wider">Temporal</th>
                <th className="p-[0.75rem_1rem] font-table-header text-table-header text-on-surface-variant uppercase tracking-wider">Boleta</th>
                <th className="p-[0.75rem_1rem] font-table-header text-table-header text-on-surface-variant uppercase tracking-wider">Comprador/a</th>
                {showVendedorCol && (
                  <th className="p-[0.75rem_1rem] font-table-header text-table-header text-on-surface-variant uppercase tracking-wider">Vendedor/a</th>
                )}
                <th className="p-[0.75rem_1rem] font-table-header text-table-header text-on-surface-variant uppercase tracking-wider">Tipo Pago</th>
                {showActividadCol && (
                  <th className="p-[0.75rem_1rem] font-table-header text-table-header text-on-surface-variant uppercase tracking-wider">Actividad</th>
                )}
                <th className="p-[0.75rem_1rem] font-table-header text-table-header text-on-surface-variant uppercase tracking-wider text-center">Cuotas</th>
                <th className="p-[0.75rem_1rem] font-table-header text-table-header text-on-surface-variant uppercase tracking-wider text-center">Verificado</th>
                {showSuperadminClubCol && (
                  <th className="p-[0.75rem_1rem] font-table-header text-table-header text-on-surface-variant uppercase tracking-wider">Club</th>
                )}
                <th className="p-[0.75rem_1rem] w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {paginatedVentas.length === 0 && (
                <tr>
                  <td colSpan={totalCols} className="p-[0.75rem_1rem] py-12 text-center text-body-sm text-on-surface-variant">
                    No se encontraron ventas.
                  </td>
                </tr>
              )}
              {paginatedVentas.map((venta) => {
                const isExpanded = expandedVenta === venta.id;
                const cuotaDelMes = getCuotaDelMesEnCurso(venta);
                const isCuotas = venta.tipoPago === 'cuotas';
                const cuotaVerificada = isCuotas ? !!cuotaDelMes?.pagada : venta.pagoVerificado;
                const isUpdating = updatingRows[venta.id];

                return (
                  <Fragment key={venta.id}>
                    <tr
                      onClick={() => setExpandedVenta(isExpanded ? null : venta.id)}
                      className={`relative cursor-pointer transition-all hover:bg-surface-variant/40 ${!cuotaVerificada ? 'bg-error-container/5' : ''} ${isUpdating ? 'opacity-60 pointer-events-none tr-loading' : ''}`}
                    >
                      <td className="p-[0.75rem_1rem] font-label-data text-label-data text-on-surface-variant whitespace-nowrap">
                        {formatDate(venta.createdAt)}
                      </td>
                      <td className="p-[0.75rem_1rem] font-label-data text-label-data text-primary font-bold">
                        #{formatPair(venta.numero)}
                      </td>
                      <td className="p-[0.75rem_1rem]">
                        <p className="font-body-base text-body-sm font-bold text-on-surface">{venta.compradorNombre}</p>
                      </td>
                      {showVendedorCol && (
                        <td className="p-[0.75rem_1rem] text-body-sm text-on-surface-variant">
                          {venta.vendedorNombre || '—'}
                        </td>
                      )}
                      <td className="p-[0.75rem_1rem] font-label-data text-label-data text-on-surface">
                        {venta.tipoPago === 'contado' ? 'Contado' : venta.tipoPago === 'transferencia' ? 'Transferencia' : `${venta.bono?.cantidadCuotas} Cuotas`}
                      </td>
                      {showActividadCol && (
                        <td className="p-[0.75rem_1rem] text-body-sm text-on-surface-variant capitalize">
                          {venta.actividad || '—'}
                        </td>
                      )}
                      <td className="p-[0.75rem_1rem]">
                        <div className="flex justify-center gap-[3px]">
                          {Array.from({ length: venta.bono?.cantidadCuotas ?? MAX_CUOTAS_FALLBACK }, (_, i) => {
                            const idx = i + 1;
                            const isPaid = venta.cuotas?.sort((a, b) => a.numeroCuota - b.numeroCuota)?.[i]?.pagada;
                            const isWithinPlan = venta.tipoPago === 'cuotas' && idx <= (venta.bono?.cantidadCuotas || 0);
                            return (
                              <div
                                key={idx}
                                className={`w-5 h-[10px] rounded-sm transition-all ${isPaid
                                  ? 'bg-[#B9E6B5] cursor-pointer hover:brightness-110'
                                  : isWithinPlan
                                    ? 'bg-surface-variant border border-outline-variant cursor-pointer hover:bg-primary/10'
                                    : 'bg-surface-variant opacity-20'
                                  }`}
                                title={
                                  isPaid
                                    ? `Cuota ${idx} pagada`
                                    : isWithinPlan
                                      ? `Cuota ${idx} pendiente`
                                      : ''
                                }
                              />
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-[0.75rem_1rem] text-center">
                        {isCuotas ? (
                          <span className="relative group inline-flex items-center justify-center cursor-default">
                            <span
                              className={`material-symbols-outlined text-lg ${cuotaVerificada ? 'text-[#B9E6B5]' : 'text-outline'}`}
                              style={cuotaVerificada ? { fontVariationSettings: "'FILL' 1" } : undefined}
                            >
                              {cuotaVerificada ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                              <div className="bg-[#1a1b21] text-white text-xs rounded-lg px-3 py-2 shadow-lg w-max max-w-[260px] text-center leading-relaxed whitespace-normal">
                                El bono en cuotas se verifica cada mes con el pago de la cuota del mes en curso.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a1b21]" />
                              </div>
                            </div>
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleVerificado(venta);
                            }}
                            disabled={isUpdating || !canToggle}
                            className={`transition-all active:scale-90 ${canToggle ? 'cursor-pointer' : 'cursor-default'} ${venta.pagoVerificado ? 'text-[#B9E6B5]' : 'text-outline'} ${canToggle ? 'hover:text-primary' : ''} disabled:opacity-50`}
                          >
                            <span
                              className="material-symbols-outlined text-lg"
                              style={venta.pagoVerificado ? { fontVariationSettings: "'FILL' 1" } : undefined}
                            >
                              {venta.pagoVerificado ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                          </button>
                        )}
                      </td>
                      {showSuperadminClubCol && (
                        <td className="p-[0.75rem_1rem] text-body-sm text-on-surface-variant">
                          {getClubNombre(venta.clubId)}
                        </td>
                      )}
                      <td className="p-[0.75rem_1rem] text-center">
                        {isCuotas && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedVenta(isExpanded ? null : venta.id);
                            }}
                            className="flex justify-center items-center px-1 py-2 hover:bg-surface-variant rounded-full transition-colors text-on-surface-variant"
                          >
                            <span className="material-symbols-outlined text-lg">
                              {isExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && venta.cuotas && venta.cuotas.length > 0 && (
                      <tr>
                        <td colSpan={totalCols} className="bg-surface-container-low px-8 py-4">
                          <div className="space-y-2 max-w-lg">
                            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Detalle de Cuotas</p>
                            {venta.cuotas.sort((a, b) => a.numeroCuota - b.numeroCuota).map((cuota) => {
                              const montoCuota = getCuotaMonto(venta);
                              return (
                                <div
                                  key={cuota.id}
                                  className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface px-4 py-2.5"
                                >
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-on-surface font-label-data">#{cuota.numeroCuota}</span>
                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cuota.pagada ? 'bg-[#B9E6B5] text-[#1a5e1a]' : 'bg-[#F1A7A7] text-[#8a1a1a]'}`}>
                                      {cuota.pagada ? 'Pagada' : 'Pendiente'}
                                    </span>
                                    <span className="text-body-sm font-medium text-on-surface-variant">
                                      ${montoCuota.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                  {canToggle && (
                                    <button
                                      onClick={() => handleToggleCuota(cuota, venta.id)}
                                      disabled={isUpdating || !canToggle}
                                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 ${cuota.pagada ? 'bg-primary-container/20 text-primary hover:bg-primary-container/40' : 'bg-primary text-on-primary hover:brightness-110'}`}
                                    >
                                      {cuota.pagada ? 'Desmarcar' : 'Pagar'}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="hidden md:flex bg-surface-container px-4 py-3 items-center justify-between border-t border-outline-variant">
          <p className="text-body-sm text-on-surface-variant">
            Mostrando <span className="font-bold">{(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, ventasFiltradas.length)}</span> de <span className="font-bold">{ventasFiltradas.length}</span> ventas
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 border border-outline-variant rounded-lg hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg text-on-surface-variant">chevron_left</span>
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 border border-outline-variant rounded-lg hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg text-on-surface-variant">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Mobile Cards */}
      <section className="md:hidden space-y-3">
        {paginatedVentas.length === 0 && (
          <div className="bg-surface border border-outline-variant rounded-xl p-8 text-center text-body-sm text-on-surface-variant">
            No se encontraron ventas.
          </div>
        )}
        {paginatedVentas.map((venta) => {
          const isExpanded = expandedVenta === venta.id;
          const cuotaDelMes = getCuotaDelMesEnCurso(venta);
          const isCuotas = venta.tipoPago === 'cuotas';
          const cuotaVerificada = isCuotas ? !!cuotaDelMes?.pagada : venta.pagoVerificado;
          const isUpdating = updatingRows[venta.id];

          return (
            <div
              key={venta.id}
              className={`bg-surface border border-outline-variant rounded-xl overflow-hidden transition-all relative ${isUpdating ? 'opacity-60 pointer-events-none' : ''} ${!cuotaVerificada ? 'border-l-4 border-l-[#F1A7A7]' : ''}`}
            >
              {isUpdating && (
                <div className="absolute inset-x-0 top-0 h-1 bg-primary/10 overflow-hidden">
                  <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#fe8903] to-transparent animate-progress-indeterminate" />
                </div>
              )}

              <div
                onClick={() => setExpandedVenta(isExpanded ? null : venta.id)}
                className="relative p-4 cursor-pointer active:bg-surface-variant/30"
              >
                {isCuotas && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedVenta(isExpanded ? null : venta.id); }}
                    className="absolute top-3 right-3 flex justify-center items-center px-1 py-2 hover:bg-surface-variant rounded-full transition-colors text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined text-xl">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 pr-10">
                  <div className="flex flex-col">
                    <span className="font-label-data text-label-data text-on-surface-variant">Números #:</span>
                    <span className="font-label-data text-label-data text-primary font-bold truncate">#{formatPair(venta.numero)}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="font-label-data text-label-data text-on-surface-variant">Comprador/a:</span>
                    <span className="font-body-base text-body-sm font-bold text-on-surface truncate">{venta.compradorNombre}</span>
                  </div>

                  {showVendedorCol && venta.vendedorNombre && (
                    <div className="flex flex-col">
                      <span className="font-label-data text-label-data text-on-surface-variant">Vendedor/a:</span>
                      <span className="font-body-base text-body-sm font-bold text-on-surface truncate">{venta.vendedorNombre}</span>
                    </div>
                  )}

                  {showActividadCol && (
                    <div className="flex flex-col">
                      <span className="font-label-data text-label-data text-on-surface-variant">Actividad:</span>
                      <span className="font-body-base text-body-sm font-bold text-on-surface truncate capitalize">
                        {venta.actividad || '—'}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col">
                    <span className="font-label-data text-label-data text-on-surface-variant">Tipo Pago:</span>
                    <span className="font-body-base text-body-sm font-bold text-on-surface truncate">
                      {venta.tipoPago === 'contado' ? 'Contado' : venta.tipoPago === 'transferencia' ? 'Transferencia' : `${venta.bono?.cantidadCuotas} Cuotas`}
                    </span>
                  </div>

                  {showSuperadminClubCol && (
                    <div className="flex flex-col">
                      <span className="font-label-data text-label-data text-on-surface-variant">Club:</span>
                      <span className="font-body-base text-body-sm font-bold text-on-surface truncate">{getClubNombre(venta.clubId)}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 pr-10 mt-4 pt-3 border-t border-outline-variant/30">
                  <div className="flex flex-col">
                    <span className="font-label-data text-label-data text-on-surface-variant">Cuotas:</span>
                    <div className="flex items-center gap-[3px] mt-1 h-[20px]">
                      {Array.from({ length: venta.bono?.cantidadCuotas ?? MAX_CUOTAS_FALLBACK }, (_, i) => {
                        const idx = i + 1;
                        const isPaid = venta.cuotas?.sort((a, b) => a.numeroCuota - b.numeroCuota)?.[i]?.pagada;
                        const isWithinPlan = venta.tipoPago === 'cuotas' && idx <= (venta.bono?.cantidadCuotas || 0);
                        return (
                          <div key={idx} className={`w-5 h-[10px] rounded-sm transition-all ${isPaid ? 'bg-[#B9E6B5]' : isWithinPlan ? 'bg-surface-variant border border-outline-variant' : 'bg-surface-variant opacity-20'}`} />
                        );
                      })}
                    </div>
                  </div>

                  {isCuotas ? (
                    <div className="flex flex-col group">
                      <span className="font-label-data text-label-data text-on-surface-variant">Verificado:</span>
                      <div className="mt-1 h-[20px] flex items-center">
                        <span className={`material-symbols-outlined text-base ${cuotaVerificada ? 'text-[#B9E6B5]' : 'text-outline'}`}
                          style={cuotaVerificada ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                          {cuotaVerificada ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col group">
                      <span className="font-label-data text-label-data text-on-surface-variant">Verificado:</span>
                      <div className="mt-1 h-[20px] flex items-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleVerificado(venta); }}
                          disabled={isUpdating || !canToggle}
                          className={`transition-all active:scale-90 disabled:opacity-50 flex items-center ${venta.pagoVerificado ? 'text-[#B9E6B5]' : 'text-outline'} ${canToggle ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          <span className="material-symbols-outlined text-base"
                            style={venta.pagoVerificado ? { fontVariationSettings: "'FILL' 1" } : undefined}
                          >
                            {venta.pagoVerificado ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {isExpanded && venta.cuotas && venta.cuotas.length > 0 && (
                <div className="border-t border-outline-variant bg-surface-container-low px-4 py-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Detalle de Cuotas</p>
                  {venta.cuotas.sort((a, b) => a.numeroCuota - b.numeroCuota).map((cuota) => {
                    const montoCuota = getCuotaMonto(venta);
                    return (
                      <div key={cuota.id} className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface px-3 py-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-sm font-bold text-on-surface font-label-data shrink-0">#{cuota.numeroCuota}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${cuota.pagada ? 'bg-[#B9E6B5] text-[#1a5e1a]' : 'bg-[#F1A7A7] text-[#8a1a1a]'}`}>
                            {cuota.pagada ? 'Pagada' : 'Pendiente'}
                          </span>
                          <span className="text-xs font-medium text-on-surface-variant truncate">
                            ${montoCuota.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {
                          canToggle && (
                            <button
                              onClick={() => handleToggleCuota(cuota, venta.id)}
                              disabled={isUpdating || !canToggle}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 shrink-0 ${cuota.pagada ? 'bg-primary-container/20 text-primary' : 'bg-primary text-on-primary'}`}
                            >
                              {cuota.pagada ? 'Desmarcar' : 'Pagar'}
                            </button>
                          )
                        }
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="flex bg-surface-container px-4 py-3 items-center justify-between rounded-xl border border-outline-variant">
          <p className="text-xs text-on-surface-variant">
            {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, ventasFiltradas.length)} de {ventasFiltradas.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 border border-outline-variant rounded-lg hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg text-on-surface-variant">chevron_left</span>
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 border border-outline-variant rounded-lg hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg text-on-surface-variant">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
