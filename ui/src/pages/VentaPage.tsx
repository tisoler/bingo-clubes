import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import type { Bono, Club, Venta, BonoClub } from '../types';

export default function VentaPage() {
  const { user } = useAuth();

  const [bonos, setBonos] = useState<Bono[]>([]);
  const [clubes, setClubes] = useState<Club[]>([]);
  const [bonoClubes, setBonoClubes] = useState<BonoClub[]>([]);
  const [selectedBono, setSelectedBono] = useState<Bono | null>(null);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [selectedNumero, setSelectedNumero] = useState<number | null>(null);
  const [numerosVendidos, setNumerosVendidos] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [ventaCreada, setVentaCreada] = useState<Venta | null>(null);
  const [userClubData, setUserClubData] = useState<Club | null>(null);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [tipoPago, setTipoPago] = useState<'contado' | 'transferencia' | 'cuotas'>('contado');
  const [cantidadCuotas, setCantidadCuotas] = useState('5');

  const isSuperadmin = user?.rol === 'superadmin';
  const effectiveClub = isSuperadmin ? selectedClub : userClubData;
  const currentBonoClub = selectedBono && effectiveClub
    ? bonoClubes.find(bc => bc.bonoId === selectedBono.id && bc.clubId === effectiveClub.id)
    : null;

  useEffect(() => {
    loadBonos();
    loadClubes();
  }, []);

  useEffect(() => {
    if (!isSuperadmin && user?.idClub) {
      const match = clubes.find(c => c.id === Number(user.idClub));
      if (match) setUserClubData(match);
    }
  }, [clubes, user, isSuperadmin]);

  useEffect(() => {
    if (bonos.length > 0 && !selectedBono) {
      setSelectedBono(bonos[0]);
    }
  }, [bonos, selectedBono]);

  useEffect(() => {
    if (selectedBono) {
      loadBonoClubes(selectedBono.id);
    }
  }, [selectedBono]);

  useEffect(() => {
    if (selectedBono && effectiveClub) {
      loadNumerosVendidos();
    }
  }, [selectedBono, effectiveClub]);

  const loadBonos = async () => {
    try {
      const res = await api.get('/bonos');
      setBonos(res.data.filter((b: Bono) => b.activo));
    } catch (err) {
      console.error('Error al cargar bonos:', err);
    }
  };

  const loadClubes = async () => {
    try {
      const res = await api.get('/clubes');
      setClubes(res.data);
    } catch (err) {
      console.error('Error al cargar clubes:', err);
    }
  };

  const loadBonoClubes = async (bonoId: number) => {
    try {
      const res = await api.get(`/bono-club/bono/${bonoId}`);
      setBonoClubes(res.data);
    } catch (err) {
      console.error('Error al cargar bono-clubes:', err);
    }
  };

  const loadNumerosVendidos = async () => {
    if (!selectedBono || !effectiveClub) return;
    try {
      const res = await api.get(`/ventas/bono/${selectedBono.id}/club/${effectiveClub.id}/numeros`);
      setNumerosVendidos(res.data.map((v: Venta) => v.numero));
    } catch (err) {
      console.error('Error al cargar números vendidos:', err);
    }
  };

  const handleSelectNumero = (num: number) => {
    if (numerosVendidos.includes(num)) return;
    setSelectedNumero(num);
  };

  const getMontoTotal = (): number => {
    if (!selectedBono) return 0;
    if (tipoPago === 'cuotas') return Number(selectedBono.montoCuota) * Number(cantidadCuotas);
    return Number(selectedBono.montoContado);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBono || selectedNumero === null || !effectiveClub) return;
    setSubmitting(true);
    try {
      const payload = {
        bonoId: selectedBono.id,
        numero: selectedNumero,
        clubId: effectiveClub.id,
        compradorNombre: `${nombre} ${apellido}`.trim(),
        tipoPago,
        cantidadCuotas: tipoPago === 'cuotas' ? Number(cantidadCuotas) : 1,
      };
      const res = await api.post('/ventas', payload);
      setVentaCreada(res.data);
      setSelectedNumero(null);
      setNombre('');
      setApellido('');
      setTipoPago('contado');
      setCantidadCuotas(String(selectedBono.cantidadCuotas));
      loadNumerosVendidos();
    } catch (err) {
      console.error('Error al crear venta:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getNumerosDisponibles = (): number[] => {
    if (!currentBonoClub) return [];
    const nums: number[] = [];
    for (let i = currentBonoClub.rangoInicio; i <= currentBonoClub.rangoFin; i++) {
      nums.push(i);
    }
    return nums;
  };

  const handleNuevaVenta = () => {
    setVentaCreada(null);
    setSelectedNumero(null);
    setNombre('');
    setApellido('');
    setTipoPago('contado');
    setCantidadCuotas(String(selectedBono?.cantidadCuotas));
  };

  const formatPair = (num: number) =>
    `${String(num).padStart(3, '0')} / ${String(num + 500).padStart(3, '0')}`;

  return (
    <>
      {ventaCreada && (
        <div className="bg-[#b9e6b5] border border-[#7cba78] rounded-2xl px-4 py-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1a5e1a]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-bold text-[#1a5e1a]">
                Venta registrada — Par {formatPair(ventaCreada.numero)} —
                {ventaCreada.bono && ` $${((ventaCreada.tipoPago === 'cuotas' ? ventaCreada.bono.montoCuota : ventaCreada.bono.montoContado)).toLocaleString('es-AR')}`}
              </span>
            </div>
            <button
              onClick={handleNuevaVenta}
              className="flex items-center gap-1.5 text-sm font-bold text-[#1a5e1a] hover:underline shrink-0"
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
              Vender otro
            </button>
          </div>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {bonos.length > 1 && (
          <div className="lg:col-span-12 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-body-sm text-secondary font-medium">Bono activo:</span>
              <div className="flex gap-1.5 flex-wrap">
                {bonos.map((bono) => (
                  <button
                    key={bono.id}
                    onClick={() => { setSelectedBono(bono); setSelectedNumero(null); }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${selectedBono?.id === bono.id
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-secondary hover:bg-surface-container-high'
                      }`}
                  >
                    {bono.nombre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <section className="mb-8 lg:col-span-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary-fixed p-2 rounded-xl">
              <span className="material-symbols-outlined text-primary">sports_soccer</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface">{isSuperadmin ? "Seleccionar Club" : "Club"}</h2>
          </div>

          {isSuperadmin ? (
            <div className="grid grid-cols-1 gap-3">
              {clubes.length === 0 && (
                <p className="text-body-sm text-secondary">No hay clubes disponibles.</p>
              )}
              {clubes.map((club) => {
                const selected = selectedClub?.id === club.id;
                const bc = bonoClubes.find(b => b.clubId === club.id);
                return (
                  <button
                    key={club.id}
                    onClick={() => { setSelectedClub(club); setSelectedNumero(null); }}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${selected
                      ? 'bg-secondary-container border-2 border-primary'
                      : 'bg-surface border border-outline-variant hover:bg-surface-container-low'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 p-1 rounded-full flex items-center justify-center overflow-hidden bg-white`}>
                        {club.urlEscudo ? (
                          <img src={club.urlEscudo} alt="escudo club" className="w-full h-full object-contain" />
                        ) : (
                          <span className={`material-symbols-outlined ${selected ? 'text-on-primary-container' : 'text-on-surface-variant'
                            }`}>
                            stars
                          </span>
                        )}
                      </div>
                      <div className="text-left">
                        <p className={`font-body-base font-bold ${selected ? 'text-primary' : 'text-on-surface'}`}>
                          {club.nombre}
                        </p>
                        {bc && (
                          <p className={`font-body-sm ${selected ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>
                            Rango: {String(bc.rangoInicio).padStart(3, '0')} - {String(bc.rangoFin).padStart(3, '0')}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`material-symbols-outlined ${selected ? 'text-primary' : 'text-outline-variant'
                      }`}>
                      {selected ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-secondary-container border-2 border-primary rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 p-1 rounded-full flex items-center justify-center overflow-hidden bg-white`}>
                  {userClubData?.urlEscudo ? (
                    <img src={userClubData.urlEscudo} alt="escudo club" className="w-full h-full object-contain" />
                  ) : (
                    <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                  )}
                </div>
                <div className="text-left">
                  <p className="font-body-base font-bold text-primary">
                    {userClubData?.nombre || user?.nombreClub || 'Cargando...'}
                  </p>
                  {currentBonoClub && (
                    <p className="font-body-sm text-on-secondary-container">
                      Rango: {String(currentBonoClub.rangoInicio).padStart(3, '0')} - {String(currentBonoClub.rangoFin).padStart(3, '0')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="mb-8 lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary-fixed p-2 rounded-xl">
                <span className="material-symbols-outlined text-primary">confirmation_number</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface">Números para vender</h2>
            </div>
            {selectedBono && (
              <div className="hidden sm:flex bg-surface-container-high px-3 py-1 rounded-full text-secondary font-label-data text-label-data">
                $ {Number(selectedBono.montoContado).toLocaleString('es-AR')} / {selectedBono.cantidadCuotas} x $ {Number(selectedBono.montoCuota).toLocaleString('es-AR')}
              </div>
            )}
          </div>

          <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant">
            {!currentBonoClub ? (
              <p className="text-body-sm text-secondary text-center py-12 font-medium">
                {selectedBono && effectiveClub
                  ? 'El club no está asignado a este bono'
                  : 'Seleccioná un club para ver los números disponibles'}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 h-64 overflow-y-auto pr-2 hide-scrollbar">
                  {getNumerosDisponibles().length === 0 && (
                    <p className="col-span-full text-body-sm text-secondary text-center py-12">
                      No hay números disponibles para este club.
                    </p>
                  )}
                  {getNumerosDisponibles().map((num) => {
                    const isSold = numerosVendidos.includes(num);
                    const isSelected = selectedNumero === num;
                    return (
                      <button
                        key={num}
                        onClick={() => handleSelectNumero(num)}
                        disabled={isSold}
                        className={`p-2 flex flex-col items-center justify-center rounded-lg font-label-data text-label-data border transition-all ${isSelected
                          ? 'bg-primary text-on-primary border-primary'
                          : isSold
                            ? 'bg-error-container text-on-error-container border-error-container opacity-50 cursor-not-allowed'
                            : 'bg-surface border-outline-variant text-on-surface hover:border-primary active:scale-95'
                          }`}
                      >
                        <span>{String(num).padStart(3, '0')}</span>
                        <span>{String(num + 500).padStart(3, '0')}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-center gap-6 text-body-sm text-secondary">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-surface border border-outline-variant"></span>
                    Disponible
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    Seleccionado
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-error-container"></span>
                    Vendido
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="lg:col-span-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary-fixed p-2 rounded-xl">
              <span className="material-symbols-outlined text-primary">person_add</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Datos del Comprador</h2>
          </div>

          {selectedNumero === null ? (
            <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant text-center">
              <span className="material-symbols-outlined text-outline-variant text-4xl mb-2 block">touch_app</span>
              <p className="text-body-sm text-secondary font-medium">Seleccioná un número para continuar</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="font-table-header text-table-header text-secondary uppercase tracking-wider ml-1">Nombre</label>
                  <input
                    className="w-full bg-surface border border-outline-variant rounded-xl p-3.5 font-body-base text-on-surface focus:border-primary transition-all placeholder:text-on-surface-variant/50"
                    placeholder="Ej. Juan"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-table-header text-table-header text-secondary uppercase tracking-wider ml-1">Apellido</label>
                  <input
                    className="w-full bg-surface border border-outline-variant rounded-xl p-3.5 font-body-base text-on-surface focus:border-primary transition-all placeholder:text-on-surface-variant/50"
                    placeholder="Ej. Perez"
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-table-header text-table-header text-secondary uppercase tracking-wider ml-1">Vendedor</label>
                  <input
                    className="w-full bg-surface-container border border-outline-variant rounded-xl p-3.5 font-body-base text-on-surface-variant cursor-not-allowed italic"
                    disabled
                    type="text"
                    value={user?.nombre || ''}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-table-header text-table-header text-secondary uppercase tracking-wider ml-1">Número seleccionado</label>
                  <div className="bg-surface-container-high rounded-xl p-3.5 font-label-data text-label-data text-center">
                    {formatPair(selectedNumero)}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="font-table-header text-table-header text-secondary uppercase tracking-wider ml-1">Tipo de Pago</label>
                  <div className="grid grid-cols-3 gap-2 bg-surface-container p-1 rounded-xl">
                    <button
                      type="button"
                      className={`rounded-lg py-2.5 font-body-base font-bold transition-all ${tipoPago === 'contado'
                        ? 'bg-surface text-primary shadow-sm'
                        : 'text-secondary hover:text-on-surface'
                        }`}
                      onClick={() => setTipoPago('contado')}
                    >
                      Contado
                    </button>
                    <button
                      type="button"
                      className={`rounded-lg py-2.5 font-body-base font-bold transition-all ${tipoPago === 'transferencia'
                        ? 'bg-surface text-primary shadow-sm'
                        : 'text-secondary hover:text-on-surface'
                        }`}
                      onClick={() => setTipoPago('transferencia')}
                    >
                      Transf.
                    </button>
                    <button
                      type="button"
                      className={`rounded-lg py-2.5 font-body-base font-bold transition-all ${tipoPago === 'cuotas'
                        ? 'bg-surface text-primary shadow-sm'
                        : 'text-secondary hover:text-on-surface'
                        }`}
                      onClick={() => setTipoPago('cuotas')}
                    >
                      Cuotas
                    </button>
                  </div>
                  {tipoPago === 'cuotas' && (
                    <div className="mt-2">
                      <select
                        value={cantidadCuotas}
                        onChange={(e) => setCantidadCuotas(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-xl p-2.5 font-body-base text-on-surface focus:border-primary transition-all appearance-none"
                        disabled
                      >
                        <option value="5">5 cuotas</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex flex-col md:flex-row gap-4 items-center justify-between border-t border-outline-variant">
                <div className="text-center md:text-left">
                  <p className="text-body-sm text-secondary">Total a abonar</p>
                  <p className="text-headline-lg font-headline-lg text-primary">
                    ${getMontoTotal().toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {selectedBono && tipoPago === 'cuotas' && (
                    <p className="text-body-sm text-secondary">
                      {Number(cantidadCuotas)} cuota{Number(cantidadCuotas) !== 1 ? 's' : ''} de ${(getMontoTotal() / Number(cantidadCuotas)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitting || !nombre.trim() || !apellido.trim()}
                  className="w-full md:w-auto px-10 py-4 bg-primary text-on-primary font-body-base font-bold rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">hourglass_top</span>
                      Registrando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Confirmar Venta
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </>
  );
}
