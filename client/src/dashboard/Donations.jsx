import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Check, X, RotateCcw, Mail, MessageCircle, Smartphone, StickyNote, Reply, CheckCheck } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDash } from './DashboardLayout.jsx';
import { PageHeader, Badge, Status, Seg, Empty, Loading, DeleteButton, useList, Modal, Field } from './ui.jsx';
import { usePagination } from '../lib/usePagination.js';
import Pagination from '../components/Pagination.jsx';
import { money, dateTime, date } from '../lib/format.js';

const PAGE_SIZE = 10;
const TONE = { pending: 'amber', confirmed: 'green', rejected: 'red' };
const CHANNELS = { email: 'Email', whatsapp: 'WhatsApp', sms: 'SMS', note: 'Private note' };
const CH_LABEL = { email: 'Email', 'email-app': 'Email', whatsapp: 'WhatsApp', sms: 'SMS', note: 'Note' };

// 0784 358 995 -> 250784358995 (Rwanda is assumed when the number starts with 0)
const intl = (p = '') => {
  const d = String(p).replace(/\D/g, '');
  return d.startsWith('0') ? `250${d.slice(1)}` : d;
};

function drafts(d, meta, staff) {
  const first = d.donorName.split(' ')[0];
  const amt = money(d.amount, d.currency);
  const org = meta?.orgName || 'Ecoplate';
  const sign = `\n\nWarm regards,\n${staff}\n${org}`;
  return {
    thanks: { label: 'Thank you', subject: `Thank you for your gift to ${org}`, body: `Dear ${first},\n\nThank you for your gift of ${amt} (reference ${d.reference}). It has reached us, and it goes straight into our work turning hotel food waste into fertilizer for farmers.${sign}` },
    reminder: { label: 'Payment reminder', subject: `About your pledge ${d.reference}`, body: `Dear ${first},\n\nThank you for pledging ${amt} to ${org}. We have not seen the money arrive yet.\n\nPlease send it by mobile money to ${meta?.momoNumber || ''} (${meta?.momoName || org}) and write the reference ${d.reference} so we can match it. If you have already sent it, reply with the transaction ID and we will check.${sign}` },
    sorry: { label: 'Could not match', subject: `About your pledge ${d.reference}`, body: `Dear ${first},\n\nThank you for wanting to support ${org}. We were not able to match a payment to your pledge ${d.reference}. If you did send money, please reply with the transaction ID and we will look again.\n\nEither way, thank you for caring about this work.${sign}` },
    blank: { label: 'Write my own', subject: '', body: `Dear ${first},\n\n${sign}` },
  };
}

function Composer({ d, meta, onSent }) {
  const { user } = useAuth();
  const toast = useToast();
  const set = useMemo(() => drafts(d, meta, user.name), [d, meta, user.name]);
  const firstKey = d.status === 'confirmed' ? 'thanks' : d.status === 'rejected' ? 'sorry' : 'reminder';
  const [tpl, setTpl] = useState(firstKey);
  const [subject, setSubject] = useState(set[firstKey].subject);
  const [message, setMessage] = useState(set[firstKey].body);
  const [channel, setChannel] = useState(d.email ? 'email' : d.phone ? 'whatsapp' : 'note');
  const [busy, setBusy] = useState(false);

  const can = { email: !!d.email, whatsapp: !!d.phone, sms: !!d.phone, note: true };
  const pick = (k) => { setTpl(k); setSubject(set[k].subject); setMessage(set[k].body); };

  async function log(ch) {
    setBusy(true);
    try {
      const u = await api.post(`donations/${d._id}/reply`, { channel: ch, subject, message });
      toast.ok(ch === 'note' ? 'Note saved' : ch === 'email' ? 'Email sent' : 'Reply recorded');
      onSent(u);
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  }

  function go() {
    if (!message.trim()) return toast.error('Write a message first.');
    if (channel === 'email') {
      if (meta?.emailEnabled) return log('email');
      const a = document.createElement('a');
      a.href = `mailto:${d.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      a.click();
      return log('email-app');
    }
    if (channel === 'whatsapp') { window.open(`https://wa.me/${intl(d.phone)}?text=${encodeURIComponent(message)}`, '_blank', 'noopener'); return log('whatsapp'); }
    if (channel === 'sms') {
      const a = document.createElement('a');
      a.href = `sms:+${intl(d.phone)}?body=${encodeURIComponent(message)}`;
      a.click();
      return log('sms');
    }
    return log('note');
  }

  const label = channel === 'email' ? (meta?.emailEnabled ? 'Send email' : 'Open in my email app') : channel === 'whatsapp' ? 'Open WhatsApp' : channel === 'sms' ? 'Open messages app' : 'Save note';
  const Icon = { email: Mail, whatsapp: MessageCircle, sms: Smartphone, note: StickyNote }[channel];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Seg value={channel} onChange={setChannel} label="How to reply" options={Object.entries(CHANNELS).filter(([k]) => can[k]).map(([k, l]) => [k, l])} />
        <label className="flex items-center gap-2 text-sm"><span className="mute font-semibold">Start from</span>
          <select className="input !w-auto" value={tpl} onChange={(e) => pick(e.target.value)}>{Object.entries(set).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}</select>
        </label>
      </div>
      {channel === 'email' && <Field label="Subject"><input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={160} /></Field>}
      <Field label={channel === 'note' ? 'Private note (the donor never sees this)' : 'Message'}>
        <textarea className="input" rows={9} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={4000} />
      </Field>
      <p className="mute text-xs">
        {channel === 'email' && (meta?.emailEnabled ? `Sent to ${d.email}.` : `Email sending is not set up on the server, so this opens your own email app addressed to ${d.email}.`)}
        {channel === 'whatsapp' && `Opens WhatsApp with the message ready for ${d.phone}. Press send there.`}
        {channel === 'sms' && `Opens your phone's messages with the text ready for ${d.phone}.`}
        {channel === 'note' && 'Saved to this donation for the rest of the team.'}
      </p>
      <div className="flex justify-end"><button className="btn btn-primary" onClick={go} disabled={busy}><Icon size={16} /> {busy ? 'Working…' : label}</button></div>
    </div>
  );
}

function DonationModal({ d, meta, onClose, setStatus, remove, onSent, startOnReply }) {
  const [tab, setTab] = useState(startOnReply ? 'reply' : 'details');
  const replies = [...(d.replies || [])].reverse();
  return (
    <Modal wide title={`Donation ${d.reference}`} onClose={onClose}>
      <dl className="grid grid-cols-[7rem_1fr] gap-y-2.5 text-sm">
        <dt className="mute">Donor</dt><dd className="font-semibold">{d.donorName}{d.anonymous && <span className="mute ml-1 font-normal">(anonymous on the website)</span>}</dd>
        <dt className="mute">Amount</dt><dd className="num font-bold">{money(d.amount, d.currency)}</dd>
        <dt className="mute">Contact</dt><dd className="break-words">{[d.email && <a key="e" className="underline" href={`mailto:${d.email}`}>{d.email}</a>, d.phone && <a key="p" className="underline" href={`tel:${d.phone}`}>{d.phone}</a>].filter(Boolean).reduce((a, x, i) => (i ? [...a, ' and ', x] : [x]), []) }</dd>
        <dt className="mute">Received</dt><dd>{dateTime(d.createdAt)}</dd>
        <dt className="mute">Status</dt><dd><Status tone={TONE[d.status]}>{d.status}</Status></dd>
        {d.message && <><dt className="mute">Their message</dt><dd className="whitespace-pre-line">{d.message}</dd></>}
      </dl>

      <div className="hair mt-5 flex flex-wrap items-center gap-2 border-y py-3">
        {d.status !== 'confirmed' && <button className="btn btn-primary" onClick={() => setStatus(d, 'confirmed')}><Check size={15} /> Confirm</button>}
        {d.status === 'pending' && <button className="btn text-red-700 hover:bg-red-50" onClick={() => setStatus(d, 'rejected')}><X size={15} /> Reject</button>}
        {d.status !== 'pending' && <button className="btn text-forest-800 hover:bg-leaf-50" onClick={() => setStatus(d, 'pending')}><RotateCcw size={14} /> Back to pending</button>}
        <span className="ml-auto"><DeleteButton onConfirm={() => remove(d)} /></span>
      </div>

      <div className="mt-4"><Seg value={tab} onChange={setTab} label="Donation sections" options={[['reply', 'Reply to donor'], ['history', 'Conversation', replies.length]]} /></div>
      <div className="mt-4">
        {tab === 'reply' ? <Composer key={d._id + d.status} d={d} meta={meta} onSent={(u) => { onSent(u); setTab('history'); }} /> : (
          replies.length === 0 ? <p className="mute">Nothing sent yet. Use <button className="font-semibold underline" onClick={() => setTab('reply')}>Reply to donor</button> to say thank you.</p> : (
            <ul className="ruled panel-soft">
              {replies.map((r, i) => (
                <li key={r._id || i} className="p-4">
                  <p className="flex flex-wrap items-center gap-2 text-sm"><Badge tone={r.channel === 'note' ? 'amber' : 'green'}>{CH_LABEL[r.channel]}</Badge><span className="font-semibold">{r.byName || 'Team'}</span><span className="mute">{dateTime(r.at)}</span></p>
                  {r.subject && <p className="mt-2 text-sm font-semibold">{r.subject}</p>}
                  <p className="mt-1 whitespace-pre-line text-sm">{r.message}</p>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </Modal>
  );
}

export default function Donations() {
  const { items, setItems, error } = useList('donations');
  const { refresh } = useDash();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [meta, setMeta] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [replyFirst, setReplyFirst] = useState(false);
  const filter = params.get('status') || 'all';
  const onlyUnreplied = params.get('unreplied') === '1';

  useEffect(() => { api.get('donations/meta').then(setMeta).catch(() => {}); }, []);
  // /dashboard/donations?reply=<id> opens that donation ready to answer
  useEffect(() => {
    const id = params.get('reply');
    if (id && items) { setOpenId(id); setReplyFirst(true); setParams((p) => { p.delete('reply'); return p; }, { replace: true }); }
  }, [params, items, setParams]);

  const list = (items || []).filter((d) => (filter === 'all' || d.status === filter) && (!onlyUnreplied || !d.lastRepliedAt));
  const { page, setPage, pageCount, pageItems } = usePagination(list, PAGE_SIZE);

  if (error) return <p className="rounded bg-red-50 p-4 text-red-700">{error}</p>;
  if (!items) return <Loading />;

  const total = items.filter((d) => d.status === 'confirmed').reduce((a, d) => a + d.amount, 0);
  const count = (s) => items.filter((d) => d.status === s).length;
  const cur = items.find((d) => d._id === openId);
  const setFilter = (k) => { setParams(k === 'all' ? {} : { status: k }, { replace: true }); setPage(1); };

  async function setStatus(d, status) {
    try {
      const u = await api.put(`donations/${d._id}`, { status });
      setItems((x) => x.map((y) => (y._id === u._id ? u : y)));
      toast.ok(status === 'confirmed' ? 'Donation confirmed' : status === 'rejected' ? 'Donation rejected' : 'Moved back to pending');
      refresh();
    } catch (e) { toast.error(e.message); }
  }
  async function remove(d) {
    try { await api.del(`donations/${d._id}`); setItems((x) => x.filter((y) => y._id !== d._id)); setOpenId(null); toast.ok('Donation deleted'); refresh(); } catch (e) { toast.error(e.message); }
  }
  const sent = (u) => { setItems((x) => x.map((y) => (y._id === u._id ? u : y))); refresh(); };
  const openIt = (d, reply) => { setOpenId(d._id); setReplyFirst(reply); };

  return (
    <>
      <PageHeader title="Donations" subtitle="Donors send mobile money, then you confirm the gift here once it arrives, and write back to thank them.">
        <button className="btn btn-outline text-forest-800" onClick={() => api.download('donations/export', 'ecoplate-donations.csv').catch((e) => toast.error(e.message))}><Download size={16} /> Export CSV</button>
      </PageHeader>

      <div className="panel mb-5 grid grid-cols-3 [&>*+*]:border-l [&>*+*]:border-[var(--d-line)]">
        <div className="px-4 py-3 sm:px-5"><p className="mute text-sm">Confirmed</p><p className="num font-display text-lg font-bold text-forest-900 sm:text-2xl">{money(total)}</p></div>
        <div className="px-4 py-3 sm:px-5"><p className="mute text-sm">To confirm</p><p className="num font-display text-lg font-bold text-forest-900 sm:text-2xl">{count('pending')}</p></div>
        <div className="px-4 py-3 sm:px-5"><p className="mute text-sm">All donations</p><p className="num font-display text-lg font-bold text-forest-900 sm:text-2xl">{items.length}</p></div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Seg value={filter} onChange={setFilter} label="Filter donations" options={[['all', 'All', items.length], ['pending', 'Pending', count('pending')], ['confirmed', 'Confirmed', count('confirmed')], ['rejected', 'Rejected', count('rejected')]]} />
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-forest-800" checked={onlyUnreplied} onChange={(e) => { const p = new URLSearchParams(params); e.target.checked ? p.set('unreplied', '1') : p.delete('unreplied'); setParams(p, { replace: true }); setPage(1); }} /> Not answered yet</label>
      </div>

      {list.length === 0 ? <Empty title="No donations here">When someone gives through the website it will show up in this list.</Empty> : (
        <ul className="panel ruled overflow-hidden">
          {pageItems.map((d) => (
            <li key={d._id} className="grid grid-cols-2 items-center gap-x-4 gap-y-2 px-4 py-3.5 md:grid-cols-[6.5rem_minmax(0,1fr)_7.5rem_9rem_auto]">
              <p className="num order-1 font-mono text-sm font-semibold md:order-none">{d.reference}</p>
              <div className="order-3 col-span-2 min-w-0 md:order-none md:col-span-1">
                <button className="max-w-full truncate text-left font-semibold underline-offset-2 hover:underline" onClick={() => openIt(d, false)}>{d.donorName}</button>
                {d.anonymous && <span className="mute ml-1 text-xs">(anonymous)</span>}
                <p className="mute truncate text-xs">{d.email || d.phone} · {date(d.createdAt)}</p>
              </div>
              <p className="num order-2 text-right font-bold md:order-none md:text-left">{money(d.amount, d.currency)}</p>
              <div className="order-4 md:order-none">
                <Status tone={TONE[d.status]}>{d.status}</Status>
                {d.lastRepliedAt && <p className="mute flex items-center gap-1 text-xs"><CheckCheck size={13} /> Answered {date(d.lastRepliedAt, { day: 'numeric', month: 'short' })}</p>}
              </div>
              <div className="order-5 flex flex-wrap items-center justify-end gap-1 md:order-none">
                {d.status === 'pending' && <button onClick={() => setStatus(d, 'confirmed')} className="btn btn-primary"><Check size={15} /> Confirm</button>}
                <button onClick={() => openIt(d, true)} className={`btn ${d.status === 'confirmed' && !d.lastRepliedAt ? 'btn-lime' : 'btn-outline text-forest-800'}`}><Reply size={15} /> {d.status === 'confirmed' && !d.lastRepliedAt ? 'Say thanks' : 'Reply'}</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} pageCount={pageCount} setPage={setPage} total={list.length} pageSize={PAGE_SIZE} />

      {cur && <DonationModal d={cur} meta={meta} startOnReply={replyFirst} onClose={() => setOpenId(null)} setStatus={setStatus} remove={remove} onSent={sent} />}
    </>
  );
}
