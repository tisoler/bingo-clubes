import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import type { Club } from '../../types';

const navItems = [
  { href: '/venta', label: 'Venta', icon: 'add_circle', roles: ['vendedor', 'admin', 'superadmin'] },
  { href: '/dashboard', label: 'Bonos', icon: 'confirmation_number', roles: ['admin', 'superadmin'] },
  { href: '/mis-ventas', label: 'Mis Ventas', icon: 'receipt_long', roles: ['vendedor'] },
  { href: '/sorteo', label: 'Sorteos', icon: 'stars', roles: ['superadmin'] },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [userClub, setUserClub] = useState<Club | null>(null);

  useEffect(() => {
    if (user?.idClub && user.rol !== 'superadmin') {
      api.get(`/clubes/${user.idClub}`).then(res => setUserClub(res.data)).catch(() => { });
    } else {
      setUserClub(null);
    }
  }, [user?.idClub, user?.rol]);

  const visibleItems = navItems.filter(item =>
    user && item.roles.includes(user.rol)
  );

  return (
    <div className="bg-background text-on-background font-body-base antialiased min-h-screen">
      {/* Top Navigation Bar */}
      <header className="bg-surface sticky top-0 z-50 border-b border-outline-variant flex items-center justify-between w-full h-20 sm:h-16 px-4 gap-1 sm:gap-2">
        <h1 className="font-headline-md text-2xl font-bold text-primary mr-4">
          El bono de los clubes
        </h1>

        {/* Desktop Nav Pills (always visible) */}
        <nav className="hidden md:flex items-center justify-center gap-1 flex-grow">
          {visibleItems.map(item => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all ${isActive
                  ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                  : 'text-secondary hover:bg-surface-container'
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {userClub && (
            <div className="flex flex-col sm:flex-row items-center gap-0 sm:gap-2 ml-1 border-r border-outline-variant pr-3">
              <div className="w-8 h-8 p-0.5 rounded-full overflow-hidden flex items-center justify-center bg-white">
                {userClub.urlEscudo ? (
                  <img src={userClub.urlEscudo} alt="escudo club" className="w-full h-full object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-secondary text-sm">sports_soccer</span>
                )}
              </div>
              <span className="text-body-sm text-secondary font-medium max-w-[120px] truncate">{userClub.nombre}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-center gap-0 sm:gap-2 ml-1">
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">person</span>
            </div>
            <span className="text-body-sm text-secondary max-w-[160px] truncate">{user?.nombre}</span>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-error-container transition-colors"
            aria-label="Cerrar sesión"
          >
            <span className="material-symbols-outlined text-error">logout</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main
          className={`flex-grow w-full transition-all duration-200 ease-in-out`}
        >
          <div className="max-w-container-max mx-auto px-4 py-6 pb-24 md:pb-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation Bar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-2 bg-surface border-t border-outline-variant md:hidden">
        {visibleItems.map(item => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center p-2 min-w-[64px] ${isActive
                ? 'bg-primary-container text-on-primary-container rounded-full px-5 shadow-md'
                : 'text-on-surface-variant'
                }`}
            >
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {item.icon}
              </span>
              <span className="font-body-sm text-body-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
