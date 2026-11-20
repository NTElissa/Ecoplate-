import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      nav('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <ThemeToggle className="fixed right-4 top-4 z-50" />
      <div className="relative hidden lg:block">
        <img src="/images/farmers-hillside.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-forest-900/55" />
        <p className="absolute bottom-10 left-10 right-10 font-display text-3xl font-bold leading-snug text-white">Waste not, grow more.</p>
      </div>
      <div className="grid place-items-center bg-paper p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <img src="/images/logo.jpg" alt="Ecoplate" className="h-16 w-16 rounded-full" />
          <h1 className="mt-5 text-3xl font-extrabold text-forest-900">Staff sign in</h1>
          <p className="mt-1 text-ink/70">Manage the Ecoplate website.</p>

          <label className="field mt-6 block"><span>Email</span>
            <input className="input" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </label>
          <label className="field mt-4 block"><span>Password</span>
            <div className="relative">
              <input className="input !pr-11" type={show ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-ink/60" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </label>

          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
          <button className="btn btn-primary mt-6 w-full" disabled={busy}><Lock size={16} /> {busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  );
}
