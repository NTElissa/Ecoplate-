import { useState } from 'react';
import { api, setToken } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { PageHeader, Field, Badge } from './ui.jsx';

export default function Account() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  async function saveName(e) {
    e.preventDefault();
    try { const r = await api.updateProfile({ name }); setUser(r.user); toast.ok('Name updated'); } catch (err) { toast.error(err.message); }
  }
  async function savePw(e) {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return toast.error('The two new passwords do not match.');
    setBusy(true);
    try {
      const r = await api.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setToken(r.token);
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      toast.ok('Password changed');
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader title="My account" subtitle={user.email} />
      <div className="grid max-w-3xl gap-6">
        <form onSubmit={saveName} className="panel p-6">
          <div className="mb-4 flex items-center gap-2"><h2 className="text-lg font-bold text-forest-900">Profile</h2><Badge tone={user.role === 'superadmin' ? 'dark' : 'green'}>{user.role === 'superadmin' ? 'Super admin' : 'Admin'}</Badge></div>
          <Field label="Your name"><input className="input" required value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <button className="btn btn-primary mt-4">Save name</button>
        </form>

        <form onSubmit={savePw} className="panel p-6">
          <h2 className="mb-4 text-lg font-bold text-forest-900">Change password</h2>
          <div className="grid gap-4">
            <Field label="Current password"><input className="input" type="password" required autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></Field>
            <Field label="New password" help="At least 8 characters."><input className="input" type="password" required minLength={8} autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
            <Field label="Repeat new password"><input className="input" type="password" required autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
          </div>
          <button className="btn btn-primary mt-4" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</button>
        </form>
      </div>
    </>
  );
}
