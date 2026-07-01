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

  return (
    <VentasListado
      title="Dashboard"
      ventas={ventas}
      setVentas={setVentas}
      loading={loading}
      showSuperadminClubCol={isSuperadmin}
      clubes={clubes}
      showVendedorCol
      showActividadCol
      canToggle={user?.rol !== 'vendedor'}
    />
  );
}
