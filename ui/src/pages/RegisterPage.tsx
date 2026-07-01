import { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import api from '../lib/api';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);

      await signOut(auth);

      const res = await api.post('/auth/register', { email, nombre });

      if (res.data.success) {
        navigate('/login?registered=true');
      } else {
        setError(res.data.message || 'Error al registrar.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('El correo ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es muy débil.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Correo electrónico inválido.');
      } else {
        setError('Error al registrar. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary-fixed to-primary-fixed-dim px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] size-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] size-[40%] rounded-full bg-primary-container/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] size-[40%] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-3xl text-on-primary">person_add</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-on-surface">
              Crear Cuenta
            </h1>
            <p className="mt-1 text-sm font-medium text-on-surface-variant">
              Registrate para comenzar
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-error-container/30 p-3 text-sm text-on-error-container border border-outline-variant">
                <span className="material-symbols-outlined text-base shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-[#B9E6B5]/30 p-3 text-sm text-[#1a5e1a] border border-outline-variant">
                <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Nombre Completo</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-on-surface-variant">person</span>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Correo Electrónico</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-on-surface-variant">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-on-surface-variant">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Confirmar Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-on-surface-variant">lock</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary py-3 font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="size-5 animate-spin rounded-full border-2 border-on-primary border-t-transparent"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">how_to_reg</span>
                  Crear Cuenta
                </>
              )}
            </button>

            <p className="text-center text-sm text-on-surface-variant">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Iniciar Sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
