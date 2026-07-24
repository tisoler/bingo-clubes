import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import type { Venta, Club } from '../types';
import VentasListado from '../components/ventas/VentasListado';

export default function DashboardPage() {
  const { user } = useAuth();
  const isSuperadmin = user?.rol === 'superadmin';

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clubes, setClubes] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClubIds, setSelectedClubIds] = useState<number[]>([]);

  useEffect(() => {
    loadData();
    if (isSuperadmin) loadClubes();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ventas');
      setVentas(res.data);
    } catch (err) {
      console.error('Error al cargar ventas:', err);
    } finally {
      setLoading(false);
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

  const toggleClub = (id: number) => {
    setSelectedClubIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const titleExtra = isSuperadmin ? (
    <div className="grid grid-cols-3 rounded-lg overflow-hidden border border-outline-variant gap-px bg-outline-variant">
      {clubes.map(club => {
        const isSelected = selectedClubIds.includes(club.id);
        return (
          <button
            key={club.id}
            onClick={() => toggleClub(club.id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-1.5 py-1.5 sm:px-3 sm:py-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all leading-none ${isSelected
              ? 'bg-primary text-on-primary'
              : 'bg-surface text-on-surface-variant hover:bg-surface-variant'
              }`}
          >
            <div className="w-7 h-7 p-0.5 rounded-full flex items-center justify-center overflow-hidden bg-white shrink-0">
              {club.urlEscudo ? (
                <img src={club.urlEscudo} alt="escudo club" className="w-full h-full object-contain" />
              ) : (
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              )}
            </div>
            {club.nombre}
          </button>
        );
      })}
    </div>
  ) : undefined;

  return (
    <VentasListado
      title="Tablero de bonos"
      ventas={ventas}
      setVentas={setVentas}
      loading={loading}
      showSuperadminClubCol={isSuperadmin}
      clubes={clubes}
      showVendedorCol
      showActividadCol
      canToggle={user?.rol !== 'vendedor'}
      canEditTipoPago={user?.rol !== 'vendedor'}
      canEditComprador={user?.rol !== 'vendedor'}
      titleExtra={titleExtra}
      clubFilter={selectedClubIds.length > 0 ? selectedClubIds : undefined}
    />
  );
}
