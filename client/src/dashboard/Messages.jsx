import { useState } from 'react';
import { Mail, Phone, CheckCheck, MailOpen, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useDash } from './DashboardLayout.jsx';
import { PageHeader, Badge, Seg, Empty, Loading, DeleteButton, useList } from './ui.jsx';
import { dateTime } from '../lib/format.js';
import { usePagination } from '../lib/usePagination.js';
import { truncateWords } from '../lib/text.js';
import Pagination from '../components/Pagination.jsx';

const INTEREST = { general: 'General question', 'hotel-partner': 'Hotel partner', farmer: 'Farmer or cooperative', buy: 'Wants to buy', media: 'Media or research', volunteer: 'Wants to help' };

export default function Messages() {
  const { items, setItems, error } = useList('messages');
  const { refresh } = useDash();
  const toast = useToast();
  const [sel, setSel] = useState(null);
  const [filter, setFilter] = useState('all');
  const list = (items || []).filter((m) => (filter === 'unread' ? !m.read : filter === 'open' ? !m.replied : true));
  const { page, setPage, pageCount, pageItems } = usePagination(list, 12);

  if (error) return <p className="rounded bg-red-50 p-4 text-red-700">{error}</p>;
  if (!items) return <Loading />;

  const cur = items.find((m) => m._id === sel);

  async function patch(m, body) {
    try {
      const u = await api.put(`messages/${m._id}`, body);
      setItems((x) => x.map((y) => (y._id === u._id ? u : y)));
      refresh();
    } catch (e) { toast.error(e.message); }
  }
  function open(m) {
    setSel(m._id);
    if (!m.read) patch(m, { read: true });
  }
  async function remove(m) {
    try { await api.del(`messages/${m._id}`); setItems((x) => x.filter((y) => y._id !== m._id)); setSel(null); toast.ok('Message deleted'); refresh(); } catch (e) { toast.error(e.message); }
  }

  return (
    <>
      <PageHeader title="Messages" subtitle="Everything people send through the contact form." />
      <div className="mb-4"><Seg value={filter} onChange={(k) => { setFilter(k); setPage(1); setSel(null); }} label="Filter messages" options={[['all', 'All', items.length], ['unread', 'Unread', items.filter((m) => !m.read).length], ['open', 'Not answered', items.filter((m) => !m.replied).length]]} /></div>

      {list.length === 0 ? <Empty title="Inbox is clear">New messages from the website will land here.</Empty> : (
        <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
          <ul className={`panel ruled overflow-hidden ${cur ? 'hidden lg:block' : ''}`}>
            {pageItems.map((m) => (
              <li key={m._id}>
                <button onClick={() => open(m)} className={`block w-full p-4 text-left hover:bg-leaf-50 ${sel === m._id ? 'bg-leaf-50' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`truncate ${m.read ? 'font-medium' : 'font-bold'}`}>{m.name}</span>
                    <span className="shrink-0 text-xs mute">{dateTime(m.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm mute">{truncateWords(`${m.subject ? `${m.subject}: ` : ''}${m.body}`, 24)}</p>
                  <div className="mt-1.5 flex gap-1.5">{!m.read && <Badge tone="amber">New</Badge>}{m.replied && <Badge tone="green">Answered</Badge>}</div>
                </button>
              </li>
            ))}
          </ul>

          {cur ? (
            <article className="panel p-5 sm:p-7">
              <button className="mb-3 flex items-center gap-1 text-sm font-semibold text-forest-700 lg:hidden" onClick={() => setSel(null)}><ArrowLeft size={16} /> Back to list</button>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h2 className="text-xl font-bold text-forest-900">{cur.subject || 'No subject'}</h2><p className="text-sm text-ink/60">{cur.name} on {dateTime(cur.createdAt)}</p></div>
                <Badge tone="blue">{INTEREST[cur.interest]}</Badge>
              </div>
              <p className="mt-5 whitespace-pre-line text-lg leading-relaxed">{cur.body}</p>
              <div className="mt-6 flex flex-wrap gap-2 text-sm">
                <a className="btn btn-primary " href={`mailto:${cur.email}?subject=${encodeURIComponent('Re: ' + (cur.subject || 'Your message to Ecoplate'))}`} onClick={() => patch(cur, { replied: true })}><Mail size={16} /> Reply by email</a>
                {cur.phone && <a className="btn btn-outline text-forest-800" href={`tel:${cur.phone}`}><Phone size={16} /> {cur.phone}</a>}
                <button className="btn btn-outline text-forest-800" onClick={() => patch(cur, { replied: !cur.replied })}><CheckCheck size={16} /> {cur.replied ? 'Mark not answered' : 'Mark answered'}</button>
                <button className="btn btn-outline text-forest-800" onClick={() => patch(cur, { read: false })}><MailOpen size={16} /> Mark unread</button>
                <span className="ml-auto"><DeleteButton onConfirm={() => remove(cur)} /></span>
              </div>
              <p className="mt-4 text-xs mute">{cur.email}</p>
            </article>
          ) : <div className="hidden place-items-center rounded-lg border-2 border-dashed hair p-10 mute lg:grid">Pick a message to read it.</div>}
        </div>
      )}
      {!cur && <Pagination page={page} pageCount={pageCount} setPage={setPage} total={list.length} pageSize={12} />}
    </>
  );
}
