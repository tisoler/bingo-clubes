import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { auth, googleProvider } from '../lib/firebase';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const registered = searchParams.get('registered');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        setError('Tu cuenta aún no ha sido verificada. Revisa tu correo electrónico.');
        await signOut(auth);
        return;
      }

      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError('Error al iniciar sesión. Verifique su correo y contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No existe una cuenta con ese correo.');
      } else {
        setError('Error al enviar el correo de recuperación.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);

      if (!userCredential.user.emailVerified) {
        setError('Tu cuenta de Google no está verificada. No puedes ingresar.');
        await signOut(auth);
        return;
      }

      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-primary-fixed to-primary-fixed-dim px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] size-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] size-[40%] rounded-full bg-primary-container/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] size-[40%] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
              <span style={{ fontSize: '2.5rem' }} className="material-symbols-outlined text-on-primary">stars</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-on-surface">
              El Bono de los Clubes
            </h1>
            <p className="mt-1 text-sm font-medium text-on-surface-variant">
              Clubes Unidos
            </p>
          </div>

          {registered === 'true' && (
            <div className="flex items-center gap-2 rounded-lg bg-[#B9E6B5]/30 p-3 text-sm text-[#1a5e1a] border border-outline-variant mb-5">
              <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
              <span>Registro exitoso. Revisá tu correo para verificar tu cuenta antes de iniciar sesión.</span>
            </div>
          )}

          {resetSent ? (
            <div className="space-y-5">
              <div className="flex items-center gap-2 rounded-lg bg-[#B5D9F2]/30 p-3 text-sm text-[#1a4a6e] border border-outline-variant">
                <span className="material-symbols-outlined text-base shrink-0">mail</span>
                <span>Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.</span>
              </div>
              <button
                type="button"
                onClick={() => { setResetMode(false); setResetSent(false); setError(''); }}
                className="w-full text-center text-sm text-primary font-bold hover:underline"
              >
                Volver a Iniciar Sesión
              </button>
            </div>
          ) : resetMode ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <p className="text-sm text-on-surface-variant">
                Ingresá tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-error-container/30 p-3 text-sm text-on-error-container border border-outline-variant">
                  <span className="material-symbols-outlined text-base shrink-0">error</span>
                  <span>{error}</span>
                </div>
              )}
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
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <div className="size-5 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">send</span>
                    Enviar enlace
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setResetMode(false); setError(''); }}
                className="w-full text-center text-sm text-primary font-bold hover:underline"
              >
                Volver a Iniciar Sesión
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-error-container/30 p-3 text-sm text-on-error-container border border-outline-variant">
                  <span className="material-symbols-outlined text-base shrink-0">error</span>
                  <span>{error}</span>
                </div>
              )}

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

              <div className="flex justify-end -mt-2">
                <button
                  type="button"
                  onClick={() => { setResetMode(true); setError(''); }}
                  className="text-sm text-primary font-bold hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary py-3 font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <div className="size-5 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">login</span>
                    Iniciar Sesión
                  </>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant" />
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="bg-surface px-2 text-on-surface-variant">O continuar con</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-outline-variant bg-surface py-3 font-bold text-on-surface transition-all hover:bg-surface-container hover:border-outline active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="size-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>

              <p className="text-center text-sm text-on-surface-variant pt-2">
                ¿No tenés cuenta?{' '}
                <Link to="/registro" className="text-primary font-bold hover:underline">
                  Registrate
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
