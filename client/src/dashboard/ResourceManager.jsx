import { useState } from 'react';
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api.js';
import { media } from '../lib/media.js';
import { useToast } from '../context/ToastContext.jsx';
import { useDash } from './DashboardLayout.jsx';
import { PageHeader, Modal, Field, ImageField, Badge, Empty, Loading, DeleteButton, Seg, useList } from './ui.jsx';
import { usePagination } from '../lib/usePagination.js';
import { truncateWords } from '../lib/text.js';
import Pagination from '../components/Pagination.jsx';

const PAGE_SIZE = 10;
const toInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

function Form({ fields, initial, onSave, onCancel, saving }) {
  const [v, setV] = useState(initial);
  const set = (k, val) => setV((x) => ({ ...x, [k]: val }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(v); }} className="space-y-4">
      {fields.map((f) => {
        const val = v[f.name] ?? '';
        if (f.type === 'image') return <ImageField key={f.name} label={f.label} help={f.help} value={val} onChange={(u) => set(f.name, u)} />;
        if (f.type === 'checkbox') return (
          <label key={f.name} className="flex items-center gap-3 font-medium"><input type="checkbox" className="h-5 w-5 accent-forest-800" checked={!!v[f.name]} onChange={(e) => set(f.name, e.target.checked)} /> {f.label}</label>
        );
        return (
          <Field key={f.name} label={f.label} help={f.help}>
            {f.type === 'textarea' ? (
              <textarea className="input" rows={f.rows || 4} value={val} required={f.required} maxLength={f.max} onChange={(e) => set(f.name, e.target.value)} />
            ) : f.type === 'select' ? (
              <select className="input" value={val} onChange={(e) => set(f.name, e.target.value)}>{f.options.map(([o, l]) => <option key={o} value={o}>{l}</option>)}</select>
            ) : (
              <input className="input" type={f.type || 'text'} value={f.type === 'date' ? toInput(val) : val} required={f.required} maxLength={f.max}
                onChange={(e) => set(f.name, f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : f.type === 'date' ? new Date(e.target.value).toISOString() : e.target.value)} />
            )}
          </Field>
        );
      })}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn btn-outline text-forest-800" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}

export default function ResourceManager({ title, subtitle, endpoint, noun, fields, defaults, card, header, filters }) {
  const { items, setItems, error, reload } = useList(endpoint);
  const { refresh } = useDash();
  const toast = useToast();
  const [editing, setEditing] = useState(null); // null | 'new' | item
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const shown = filters && filter !== 'all' ? (items || []).filter((i) => filters.test(i, filter)) : (items || []);
  const { page, setPage, pageCount, pageItems } = usePagination(shown, PAGE_SIZE);

  if (error) return <p className="rounded bg-red-50 p-4 text-red-700">{error}</p>;
  if (!items) return <Loading />;

  async function save(v) {
    setSaving(true);
    try {
      const body = { ...v };
      delete body._id; delete body.__v; delete body.createdAt; delete body.updatedAt;
      if (editing === 'new') {
        const created = await api.post(endpoint, body);
        setItems((x) => [...x, created]);
        toast.ok(`${noun} added`);
        reload();
      } else {
        const updated = await api.put(`${endpoint}/${editing._id}`, body);
        setItems((x) => x.map((i) => (i._id === updated._id ? updated : i)));
        toast.ok(`${noun} saved`);
      }
      setEditing(null);
      refresh();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(i) {
    try {
      await api.del(`${endpoint}/${i._id}`);
      setItems((x) => x.filter((y) => y._id !== i._id));
      toast.ok(`${noun} deleted`);
      refresh();
    } catch (e) { toast.error(e.message); }
  }

  async function toggle(i) {
    try {
      const u = await api.put(`${endpoint}/${i._id}`, { published: !i.published });
      setItems((x) => x.map((y) => (y._id === u._id ? u : y)));
      toast.ok(u.published ? `${noun} is now visible on the website` : `${noun} hidden from the website`);
    } catch (e) { toast.error(e.message); }
  }

  const seg = filters && [['all', 'All', items.length], ...filters.options.map(([k, l]) => [k, l, items.filter((i) => filters.test(i, k)).length])];

  return (
    <>
      <PageHeader title={title} subtitle={subtitle}>
        {header?.({ reload, refresh, toast })}
        <button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={17} /> Add {noun.toLowerCase()}</button>
      </PageHeader>

      {filters && <div className="mb-4"><Seg value={filter} onChange={(k) => { setFilter(k); setPage(1); }} options={seg} label={`Filter ${title.toLowerCase()}`} /></div>}

      {shown.length === 0 ? (
        <Empty title={`No ${noun.toLowerCase()} yet`}>Add the first one and it will appear on the website.</Empty>
      ) : (
        <ul className="panel ruled overflow-hidden">
          {pageItems.map((i) => {
            const c = card(i);
            return (
              <li key={i._id} className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 ${i.published === false ? 'opacity-60' : ''}`}>
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  {c.image !== undefined && (
                    <div className="hair h-16 w-20 shrink-0 overflow-hidden rounded border bg-leaf-50 sm:h-[4.25rem] sm:w-24">{c.image ? <img src={media(c.image)} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}</div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="font-display text-base font-bold leading-snug text-forest-900 sm:text-lg">{c.title}</h3>
                      {(c.badges || []).map((b, n) => <Badge key={n} tone={b[1]}>{b[0]}</Badge>)}
                      {i.published === false && <Badge tone="gray">Hidden</Badge>}
                    </div>
                    {c.sub && <p className="mute mt-0.5 line-clamp-2 text-sm">{truncateWords(c.sub, 28)}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 sm:justify-end">
                  <button className="btn text-forest-800 hover:bg-leaf-50" onClick={() => setEditing(i)}><Pencil size={15} /> Edit</button>
                  {'published' in i && <button className="btn text-forest-800 hover:bg-leaf-50" onClick={() => toggle(i)} aria-label={i.published ? 'Hide from website' : 'Show on website'}>{i.published ? <><EyeOff size={15} /> Hide</> : <><Eye size={15} /> Show</>}</button>}
                  <span className="ml-auto sm:ml-0"><DeleteButton onConfirm={() => remove(i)} label="" /></span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Pagination page={page} pageCount={pageCount} setPage={setPage} total={shown.length} pageSize={PAGE_SIZE} />

      {editing && (
        <Modal title={editing === 'new' ? `Add ${noun.toLowerCase()}` : `Edit ${noun.toLowerCase()}`} onClose={() => setEditing(null)}>
          <Form fields={fields} initial={editing === 'new' ? defaults : editing} onSave={save} onCancel={() => setEditing(null)} saving={saving} />
        </Modal>
      )}
    </>
  );
}
