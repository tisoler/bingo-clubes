import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { Bono, Sorteo, ValidacionResultado } from '../types';

type SorteoConVenta = Sorteo & { venta?: { compradorNombre: string; club?: { nombre: string; urlEscudo?: string }; vendedorUid: string; vendedorNombre?: string } | null };

export default function SorteoPage() {
  const [bonos, setBonos] = useState<Bono[]>([]);
  const [historial, setHistorial] = useState<SorteoConVenta[]>([]);
  const [selectedBonoId, setSelectedBonoId] = useState('');
  const [fechaSorteo, setFechaSorteo] = useState('');
  const [mes, setMes] = useState('');
  const [premio, setPremio] = useState('');
  const [numeroGanador, setNumeroGanador] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ultimoSorteo, setUltimoSorteo] = useState<SorteoConVenta | null>(null);
  const [error, setError] = useState('');
  const [validacion, setValidacion] = useState<ValidacionResultado | null>(null);
  const [validando, setValidando] = useState(false);

  useEffect(() => {
    loadBonos();
    loadHistorial();
  }, []);

  const loadBonos = async () => {
    try {
      const res = await api.get('/bonos');
      setBonos(res.data.filter((b: Bono) => b.activo));
    } catch (err) {
      console.error('Error al cargar bonos:', err);
    }
  };

  const loadHistorial = async () => {
    try {
      const res = await api.get('/sorteos');
      setHistorial(res.data);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    }
  };

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFechaSorteo(val);
    if (val) {
      const month = new Date(val).getMonth() + 1;
      setMes(String(month));
    }
    setUltimoSorteo(null);
    setValidacion(null);
    setError('');
  };

  const handleMesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMes(e.target.value);
    setUltimoSorteo(null);
    setValidacion(null);
    setError('');
  };

  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumeroGanador(e.target.value);
    setUltimoSorteo(null);
    setValidacion(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBonoId || !fechaSorteo || !mes || !premio || !numeroGanador) return;

    // If not yet validated as winner, validate first
    if (validacion?.status !== 'ganador') {
      setValidando(true);
      setError('');
      try {
        const res = await api.get('/sorteos/validar', {
          params: { bonoId: Number(selectedBonoId), numero: Number(numeroGanador), mes: Number(mes) },
        });
        setValidacion(res.data);
      } catch {
        setValidacion({ status: 'vacante', mensaje: 'Error al validar el número', venta: null });
      } finally {
        setValidando(false);
      }
      return;
    }

    // Winner confirmed — register the raffle
    setSubmitting(true);
    setError('');
    setUltimoSorteo(null);
    try {
      const payload = { bonoId: Number(selectedBonoId), fechaSorteo, mes: Number(mes), premio, numeroGanador: Number(numeroGanador) };
      const res = await api.post('/sorteos', payload);
      setUltimoSorteo(res.data);
      setNumeroGanador('');
      setPremio('');
      setFechaSorteo('');
      setMes('');
      setValidacion(null);
      loadHistorial();
    } catch (err: any) {
      console.error('Error al registrar sorteo:', err);
      setError(err.response?.data?.message || 'Error al registrar el sorteo.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPair = (num: number) => `${String(num).padStart(3, '0')} / ${String(num + 500).padStart(3, '0')}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 bg-white border border-outline-variant rounded-xl p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">add_box</span>
              Nuevo Sorteo
            </h3>
            <span className="text-xs font-bold bg-secondary-container px-2 py-1 rounded text-on-secondary-container">MODO SUPERADMIN</span>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 font-medium">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-table-header text-table-header text-secondary uppercase">Bono</label>
                <select
                  value={selectedBonoId}
                  onChange={(e) => setSelectedBonoId(e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-lg p-2.5 font-body-base focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  required
                >
                  <option value="">Seleccionar</option>
                  {bonos.map((b) => (
                    <option key={b.id} value={b.id}>{b.nombre} {b.anio}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-table-header text-table-header text-secondary uppercase">Premio Principal</label>
                <input
                  type="text"
                  value={premio}
                  onChange={(e) => setPremio(e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-lg p-2.5 font-body-base focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Ej: Automóvil 0km"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-table-header text-table-header text-secondary uppercase">Fecha del Sorteo</label>
                <input
                  type="date"
                  value={fechaSorteo}
                  onChange={handleFechaChange}
                  className="w-full bg-white border border-outline-variant rounded-lg p-2.5 font-body-base focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-table-header text-table-header text-secondary uppercase">Mes</label>
                <select
                  value={mes}
                  onChange={handleMesChange}
                  className="w-full bg-white border border-outline-variant rounded-lg p-2.5 font-body-base focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  required
                >
                  <option value="">Mes</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                    <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-table-header text-table-header text-secondary uppercase">Número Ganador</label>
                <input
                  type="number"
                  value={numeroGanador}
                  onChange={handleNumeroChange}
                  className="w-full bg-white border border-outline-variant rounded-lg p-2.5 font-body-base text-center font-label-data text-lg tracking-widest focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="000-999"
                  min="0"
                  max="999"
                  required
                />
                {validando && (
                  <p className="text-xs text-secondary mt-1">Validando número...</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || validando}
              className={`w-full py-3 font-bold rounded-xl shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 ${validacion?.status === 'ganador'
                ? 'bg-primary text-on-primary shadow-primary-container/20 hover:shadow-xl'
                : 'bg-primary-container text-on-primary-container shadow-primary-container/10 hover:shadow-lg'
                }`}
            >
              {submitting
                ? 'Registrando...'
                : validando
                  ? 'Validando...'
                  : validacion?.status === 'ganador'
                    ? 'Registrar el sorteo'
                    : 'Validar número'
              }
            </button>
          </form>
        </section>

        <section className="lg:col-span-6 bg-white border border-outline-variant rounded-xl p-6 relative overflow-hidden flex flex-col justify-center min-h-[320px] shadow-sm">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none"></div>

          {validando && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
              <span className="material-symbols-outlined text-6xl text-secondary animate-pulse">sync</span>
              <p className="text-body-sm text-secondary">Validando número...</p>
            </div>
          )}

          {!validando && !validacion && !ultimoSorteo && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 opacity-40 py-12">
              <span className="material-symbols-outlined text-6xl">account_circle_off</span>
              <div className="max-w-xs">
                <p className="font-headline-md text-headline-md">Esperando validación</p>
                <p className="text-body-sm">Ingrese un número de boleta para identificar al ganador/a en tiempo real.</p>
              </div>
            </div>
          )}

          {!validando && validacion && validacion.status === 'vacante' && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
              <span className="material-symbols-outlined text-6xl text-secondary">person_off</span>
              <div className="max-w-xs">
                <p className="font-headline-md text-headline-md text-secondary">Vacante</p>
                <p className="text-body-sm text-secondary">{validacion.mensaje}</p>
              </div>
            </div>
          )}

          {!validando && validacion && validacion.status === 'inhabilitado' && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
              <span className="material-symbols-outlined text-6xl text-warning">gpp_maybe</span>
              <div className="max-w-xs">
                <p className="font-headline-md text-headline-md text-warning">Inhabilitado</p>
                <p className="text-body-sm text-secondary">{validacion.mensaje}</p>
              </div>
            </div>
          )}

          {!validando && validacion && validacion.status === 'ganador' && !ultimoSorteo && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <div className="w-28 h-28 p-[10px] rounded-full border-4 border-primary-container flex items-center justify-center overflow-hidden bg-white">
                    {validacion.venta?.club?.urlEscudo ? (
                      <img src={validacion.venta.club.urlEscudo} alt="escudo club" className="w-full h-full object-contain" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-primary">emoji_events</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary w-9 h-9 rounded-full flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                  <div className="inline-block bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-1">
                    Ganador/a Confirmado/a
                  </div>
                  <h4 className="font-headline-lg text-2xl text-primary leading-tight font-bold">
                    {validacion.venta?.compradorNombre || '—'}
                  </h4>
                  <p className="font-label-data text-lg text-primary font-bold">
                    # {formatPair(validacion.venta!.numero)}
                  </p>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-outline-variant mt-4">
                    <div>
                      <p className="text-[10px] font-bold text-secondary uppercase">Club Vendedor</p>
                      <p className="font-body-base font-bold text-on-surface">
                        {validacion.venta?.club?.nombre || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-secondary uppercase">Vendedor/a</p>
                      <p className="font-body-base font-bold text-on-surface">
                        {validacion.venta?.vendedorNombre || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-secondary uppercase">Premio</p>
                      <p className="font-body-base font-bold text-on-surface">{premio || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {ultimoSorteo && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <div className="w-28 h-28 p-[10px] rounded-full border-4 border-primary-container flex items-center justify-center overflow-hidden bg-white">
                    {ultimoSorteo.venta?.club?.urlEscudo ? (
                      <img src={ultimoSorteo.venta.club.urlEscudo} alt="escudo club" className="w-full h-full object-contain" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-primary">emoji_events</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary w-9 h-9 rounded-full flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                  <div className="inline-block bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-1">
                    Ganador/a Confirmado/a
                  </div>
                  <h4 className="font-headline-lg text-2xl text-primary leading-tight font-bold">
                    {ultimoSorteo.venta?.compradorNombre || 'Número no vendido'}
                  </h4>
                  <p className="font-label-data text-lg text-primary font-bold">
                    # {formatPair(ultimoSorteo.numeroGanador >= 500 ? ultimoSorteo.numeroGanador - 500 : ultimoSorteo.numeroGanador)}
                  </p>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-outline-variant mt-4">
                    <div>
                      <p className="text-[10px] font-bold text-secondary uppercase">Club Vendedor</p>
                      <p className="font-body-base font-bold text-on-surface">
                        {ultimoSorteo.venta?.club?.nombre || ultimoSorteo.club?.nombre || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-secondary uppercase">Vendedor/a</p>
                      <p className="font-body-base font-bold text-on-surface">
                        {ultimoSorteo.venta?.vendedorNombre || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-secondary uppercase">Premio</p>
                      <p className="font-body-base font-bold text-on-surface">{ultimoSorteo.premio}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant pb-2">
          <h3 className="font-headline-md text-headline-md text-primary">Historial de Sorteos Anteriores</h3>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          {historial.length === 0 ? (
            <div className="p-8 text-center text-secondary text-body-sm">No hay sorteos registrados aún.</div>
          ) : (
            <>
              {/* Desktop table */}
              <table className="hidden md:table w-full border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="font-table-header text-table-header text-secondary uppercase text-left p-3">Fecha</th>
                    <th className="font-table-header text-table-header text-secondary uppercase text-left p-3">Número</th>
                    <th className="font-table-header text-table-header text-secondary uppercase text-left p-3">Premio</th>
                    <th className="font-table-header text-table-header text-secondary uppercase text-left p-3">Ganador/a</th>
                    <th className="font-table-header text-table-header text-secondary uppercase text-left p-3">Vendedor/a</th>
                    <th className="font-table-header text-table-header text-secondary uppercase text-left p-3">Club</th>
                    <th className="font-table-header text-table-header text-secondary uppercase text-right p-3">Bono</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {historial.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-variant/30 transition-colors">
                      <td className="p-3 font-body-sm">{formatDate(s.fechaSorteo as unknown as string)}</td>
                      <td className="p-3 font-label-data text-primary font-bold">
                        {s.numeroGanador != null && formatPair(s.numeroGanador >= 500 ? s.numeroGanador - 500 : s.numeroGanador)}
                      </td>
                      <td className="p-3 font-body-sm">{s.premio}</td>
                      <td className="p-3 font-body-sm font-bold">{s.venta?.compradorNombre || '—'}</td>
                      <td className="p-3 font-body-sm">{s.venta?.vendedorNombre || '—'}</td>
                      <td className="p-3 font-body-sm text-secondary">
                        <span className="inline-flex items-center gap-2">
                          {s.venta?.club?.urlEscudo && (
                            <img src={s.venta.club.urlEscudo} alt="" className="w-4 h-4 rounded-full object-contain" />
                          )}
                          {s.venta?.club?.nombre || s.club?.nombre || '—'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-body-sm text-secondary">{s.bono?.nombre}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-outline-variant">
                {historial.map((s) => (
                  <div key={s.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-label-data text-primary font-bold text-lg">
                        {s.numeroGanador != null && formatPair(s.numeroGanador >= 500 ? s.numeroGanador - 500 : s.numeroGanador)}
                      </span>
                      <span className="text-xs text-secondary font-medium">{formatDate(s.fechaSorteo as unknown as string)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <span className="text-[10px] font-bold text-secondary uppercase">Ganador/a</span>
                        <p className="font-bold text-on-surface">{s.venta?.compradorNombre || '—'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-secondary uppercase">Premio</span>
                        <p className="text-on-surface">{s.premio}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-secondary uppercase">Vendedor/a</span>
                        <p className="text-on-surface">{s.venta?.vendedorNombre || '—'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-secondary uppercase">Club</span>
                        <p className="text-on-surface flex items-center gap-1">
                          {s.venta?.club?.urlEscudo && (
                            <img src={s.venta.club.urlEscudo} alt="" className="w-4 h-4 rounded-full object-contain" />
                          )}
                          {s.venta?.club?.nombre || s.club?.nombre || '—'}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-secondary">{s.bono?.nombre}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
