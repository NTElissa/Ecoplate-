import { useEffect, useRef, useState } from 'react';
import { X, ImagePlus, Trash2, Loader2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { media } from '../lib/media.js';
import { useToast } from '../context/ToastContext.jsx';

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="rule-double mb-6 flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-[1.65rem] font-bold leading-tight text-forest-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mute mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[80] grid place-items-end bg-black/55 sm:place-items-center sm:p-6" style={{ background: 'rgb(0 0 0 / .55)' }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`panel flex max-h-[94vh] w-full flex-col !rounded-b-none sm:!rounded-lg ${wide ? 'max-w-3xl' : 'max-w-xl'}`} style={{ boxShadow: '0 30px 60px -20px rgb(0 0 0 / .5)' }}>
        <div className="hair flex items-center justify-between border-b px-5 py-3.5">
          <h2 className="font-display text-lg font-bold text-forest-900">{title}</h2>
          <button onClick={onClose} className="rounded p-1.5 hover:bg-leaf-50" aria-label="Close"><X size={19} /></button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, help, children, className = '' }) {
  return (
    <label className={`field block ${className}`}>
      <span>{label}</span>
      {children}
      {help && <small className="mute mt-1 block text-xs">{help}</small>}
    </label>
  );
}

export function ImageField({ label = 'Image', value, onChange, help }) {
  const ref = useRef();
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const { url } = await api.upload(file);
      onChange(url);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="mute mb-1.5 text-[.8rem] font-semibold">{label}</p>
      <div className="flex items-center gap-4">
        <div className="hair mute grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded border-2 border-dashed bg-leaf-50">
          {busy ? <Loader2 className="animate-spin" /> : value ? <img src={media(value)} alt="" className="h-full w-full object-cover" /> : <ImagePlus />}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline text-forest-800" onClick={() => ref.current.click()} disabled={busy}>{value ? 'Replace' : 'Choose image'}</button>
          {value && <button type="button" className="btn text-red-700 hover:bg-red-50" onClick={() => onChange('')}><Trash2 size={15} /> Remove</button>}
        </div>
        <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={pick} />
      </div>
      {help && <small className="mute mt-1 block text-xs">{help}</small>}
    </div>
  );
}

// small square tag
export function Badge({ children, tone = 'gray' }) {
  const tones = {
    gray: 'bg-gray-100 text-gray-700', green: 'bg-leaf-100 text-forest-800', amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-700', blue: 'bg-sky-100 text-sky-800', dark: 'bg-forest-800 text-white',
  };
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

// status as a coloured dot and a word, like a ledger column
export function Status({ tone = 'gray', children }) {
  const dot = { gray: 'bg-gray-400', green: 'bg-leaf-500', amber: 'bg-amber-500', red: 'bg-red-500', blue: 'bg-sky-500' }[tone];
  return <span className="inline-flex items-center gap-1.5 text-sm font-medium"><i className={`h-2 w-2 rounded-full ${dot}`} />{children}</span>;
}

// a joined group of buttons, used for filters
export function Seg({ value, onChange, options, label = 'Filter' }) {
  return (
    <div role="tablist" aria-label={label} className="hair panel inline-flex max-w-full overflow-x-auto !rounded-md p-0.5">
      {options.map(([k, l, n]) => (
        <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)}
          className={`shrink-0 whitespace-nowrap rounded px-3 py-1.5 text-sm font-semibold transition-colors ${value === k ? 'bg-forest-800 text-white' : 'text-forest-800 hover:bg-leaf-100'}`}>
          {l}{n !== undefined && <span className={`num ml-1.5 text-xs ${value === k ? 'text-leaf-200' : 'mute'}`}>{n}</span>}
        </button>
      ))}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="hair rounded-lg border-2 border-dashed p-10 text-center">
      <p className="font-display text-xl font-bold text-forest-900">{title}</p>
      {children && <p className="mute mx-auto mt-1 max-w-sm">{children}</p>}
    </div>
  );
}

export function Loading() {
  return <div className="grid place-items-center py-20"><div className="h-9 w-9 animate-spin rounded-full border-4 border-leaf-200 border-t-forest-800" /></div>;
}

// Two-step delete so nothing disappears by accident.
export function DeleteButton({ onConfirm, label = 'Delete' }) {
  const [ask, setAsk] = useState(false);
  useEffect(() => { if (!ask) return; const t = setTimeout(() => setAsk(false), 4000); return () => clearTimeout(t); }, [ask]);
  return ask ? (
    <button onClick={onConfirm} className="btn bg-red-600 text-white hover:bg-red-700">Yes, delete</button>
  ) : (
    <button onClick={() => setAsk(true)} className="btn text-red-700 hover:bg-red-50" aria-label="Delete"><Trash2 size={15} /> {label}</button>
  );
}

export function useList(path) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const load = () => api.get(path).then(setItems).catch((e) => setError(e.message));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [path]);
  return { items, setItems, error, reload: load };
}
