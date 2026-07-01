import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VentaPage from './pages/VentaPage';
import DashboardPage from './pages/DashboardPage';
import MisVentasPage from './pages/MisVentasPage';
import SorteoPage from './pages/SorteoPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/venta" element={<VentaPage />} />
              <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}>
                <Route path="/dashboard" element={<DashboardPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['vendedor', 'admin', 'superadmin']} />}>
                <Route path="/mis-ventas" element={<MisVentasPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                <Route path="/sorteo" element={<SorteoPage />} />
              </Route>
              <Route path="/" element={<Navigate to="/venta" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
