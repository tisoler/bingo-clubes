import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import type { Venta } from '../types';
import VentasListado from '../components/ventas/VentasListado';

export default function MisVentasPage() {
  const { user } = useAuth();

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ventas');
      const uid = user?.firebaseUid;
      setVentas(uid ? res.data.filter((v: Venta) => v.vendedorUid === uid) : []);
    } catch (err) {
      console.error('Error al cargar ventas:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VentasListado
      title="Mis Ventas"
      ventas={ventas}
      setVentas={setVentas}
      loading={loading}
      showActividadCol
      canToggle={user?.rol !== 'vendedor'}
    />
  );
}
