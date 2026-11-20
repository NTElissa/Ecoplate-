import { useEffect, useState } from 'react';
import { Plus, Pencil, KeyRound } from 'lucide-react';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { PageHeader, Modal, Field, Badge, Loading, DeleteButton, useList } from './ui.jsx';
import { dateTime } from '../lib/format.js';
import { usePagination } from '../lib/usePagination.js';
import Pagination from '../components/Pagination.jsx';

const PAGE_SIZE = 8;
const LABELS = {
  content: 'Page content (hero, about, contact, donation details)', goals: 'Goals and steps', projects: 'Projects', partners: 'Partners',
  announcements: 'Announcements', gallery: 'Gallery', donations: 'Donations', messages: 'Messages', subscribers: 'Subscribers',
};

function AdminForm({ admin, perms, onDone }) {
  const toast = useToast();
  const isNew = !admin;
  const [v, setV] = useState({ name: admin?.name || '', email: admin?.email || '', password: '', permissions: admin?.permissions || [], active: admin?.active ?? true });
  const [busy, setBusy] = useState(false);
  const toggle = (p) => setV((x) => ({ ...x, permissions: x.permissions.includes(p) ? x.permissions.filter((y) => y !== p) : [...x.permissions, p] }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...v };
      if (!isNew && !body.password) delete body.password;
      if (isNew) await api.post('users', body); else await api.put(`users/${admin._id}`, body);
      toast.ok(isNew ? 'Admin created' : 'Admin updated');
      onDone();
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Full name"><input className="input" required value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
      <Field label="Email (used to sign in)"><input className="input" type="email" required value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
      <Field label={isNew ? 'Password' : 'New password (leave empty to keep the current one)'} help="At least 8 characters.">
        <input className="input" type="text" autoComplete="new-password" required={isNew} minLength={8} value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} />
      </Field>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">What can this admin manage?</legend>
        <div className="mb-2 flex gap-3 text-sm">
          <button type="button" className="font-semibold text-forest-700 underline" onClick={() => setV({ ...v, permissions: perms })}>Select all</button>
          <button type="button" className="font-semibold text-forest-700 underline" onClick={() => setV({ ...v, permissions: [] })}>Clear</button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {perms.map((p) => (
            <label key={p} className="flex items-start gap-3 rounded border hair p-3 text-sm">
              <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-forest-800" checked={v.permissions.includes(p)} onChange={() => toggle(p)} /> {LABELS[p] || p}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-3 font-medium"><input type="checkbox" className="h-5 w-5 accent-forest-800" checked={v.active} onChange={(e) => setV({ ...v, active: e.target.checked })} /> Account is active (can sign in)</label>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn btn-outline text-forest-800" onClick={() => onDone(false)}>Cancel</button>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : isNew ? 'Create admin' : 'Save changes'}</button>
      </div>
    </form>
  );
}

export default function Admins() {
  const { items, error, reload } = useList('users');
  const { page, setPage, pageCount, pageItems } = usePagination(items || [], PAGE_SIZE);
  const [perms, setPerms] = useState([]);
  const [editing, setEditing] = useState(null);
  const toast = useToast();
  useEffect(() => { api.get('permissions').then(setPerms).catch(() => {}); }, []);

  if (error) return <p className="rounded bg-red-50 p-4 text-red-700">{error}</p>;
  if (!items) return <Loading />;

  async function remove(u) {
    try { await api.del(`users/${u._id}`); toast.ok('Admin deleted'); reload(); } catch (e) { toast.error(e.message); }
  }
  const done = (changed = true) => { setEditing(null); if (changed) reload(); };

  return (
    <>
      <PageHeader title="Admins" subtitle="Create team accounts and choose exactly which parts of the dashboard each person can use.">
        <button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={18} /> Add admin</button>
      </PageHeader>

      <ul className="grid gap-4 md:grid-cols-2">
        {pageItems.map((u) => (
          <li key={u._id} className="panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><h3 className="truncate font-display text-lg font-bold text-forest-900">{u.name}</h3><p className="truncate text-sm mute">{u.email}</p></div>
              <div className="flex shrink-0 gap-1.5">{u.role === 'superadmin' ? <Badge tone="dark">Super admin</Badge> : <Badge tone="green">Admin</Badge>}{!u.active && <Badge tone="red">Off</Badge>}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {u.role === 'superadmin' ? <Badge tone="gray">Full access</Badge> : u.permissions.length ? u.permissions.map((p) => <Badge key={p} tone="gray">{p}</Badge>) : <span className="text-sm mute">No sections yet</span>}
            </div>
            <p className="mt-3 text-xs mute">{u.lastLogin ? `Last sign in ${dateTime(u.lastLogin)}` : 'Has not signed in yet'}</p>
            {u.role !== 'superadmin' && (
              <div className="mt-4 flex items-center gap-1">
                <button className="btn text-sm text-forest-800 hover:bg-leaf-50" onClick={() => setEditing(u)}><Pencil size={15} /> Edit access</button>
                <button className="btn text-sm text-forest-800 hover:bg-leaf-50" onClick={() => setEditing(u)}><KeyRound size={15} /> Reset password</button>
                <span className="ml-auto"><DeleteButton onConfirm={() => remove(u)} label="" /></span>
              </div>
            )}
          </li>
        ))}
      </ul>
      <Pagination page={page} pageCount={pageCount} setPage={setPage} total={items.length} pageSize={PAGE_SIZE} />

      {editing && (
        <Modal wide title={editing === 'new' ? 'Add admin' : `Edit ${editing.name}`} onClose={() => setEditing(null)}>
          <AdminForm admin={editing === 'new' ? null : editing} perms={perms} onDone={done} />
        </Modal>
      )}
    </>
  );
}
