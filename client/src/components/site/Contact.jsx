import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Globe } from 'lucide-react';
import { Container, Heading } from '../Section.jsx';
import { api } from '../../lib/api.js';

const INTERESTS = [
  ['general', 'A general question'],
  ['hotel-partner', 'My hotel wants to partner'],
  ['farmer', 'I am a farmer or cooperative'],
  ['buy', 'I want to buy fertilizer'],
  ['volunteer', 'I want to help or volunteer'],
  ['media', 'Media or research'],
];

export default function Contact({ s }) {
  const c = s.contact;
  const [f, setF] = useState({ name: '', email: '', phone: '', interest: 'general', subject: '', body: '', website: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const r = await api.message(f);
      setMsg({ ok: true, text: r.message });
      setF({ name: '', email: '', phone: '', interest: 'general', subject: '', body: '', website: '' });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  }

  const items = [
    c.phone && [Phone, 'Call or WhatsApp', c.phone, `tel:${c.phone.replace(/\s/g, '')}`],
    c.email && [Mail, 'Email', c.email, `mailto:${c.email}`],
    c.address && [MapPin, 'Find us', c.address],
    c.hours && [Clock, 'Hours', c.hours],
    c.website && [Globe, 'Website', c.website.replace(/^https?:\/\//, ''), c.website],
  ].filter(Boolean);

  return (
    <section id="contact" className="bg-paper py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div className="reveal reveal-left">
          <Heading title="Let us talk">Hotel owner, farmer, researcher, neighbour. Write to us and a real person will answer.</Heading>
          <ul className="mt-8 space-y-5">
            {items.map(([Icon, label, value, href]) => (
              <li key={label} className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-leaf-100 text-forest-800"><Icon size={20} /></span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-forest-600">{label}</p>
                  {href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="break-words text-lg font-medium text-forest-900 underline-offset-2 hover:underline">{value}</a> : <p className="text-lg font-medium text-forest-900">{value}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={submit} className="reveal reveal-right rounded-3xl bg-white p-6 shadow-sm sm:p-8" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field"><span>Your name</span><input className="input" required autoComplete="name" value={f.name} onChange={set('name')} /></label>
            <label className="field"><span>Email</span><input className="input" type="email" required autoComplete="email" value={f.email} onChange={set('email')} /></label>
            <label className="field"><span>Phone (optional)</span><input className="input" type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} /></label>
            <label className="field"><span>I am writing about</span>
              <select className="input" value={f.interest} onChange={set('interest')}>{INTERESTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </label>
            <label className="field sm:col-span-2"><span>Subject (optional)</span><input className="input" value={f.subject} onChange={set('subject')} /></label>
            <label className="field sm:col-span-2"><span>Message</span><textarea className="input" rows={5} required maxLength={4000} value={f.body} onChange={set('body')} /></label>
            {/* hidden field: real people never fill it in, bots do */}
            <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" name="website" value={f.website} onChange={set('website')} />
          </div>
          {msg && <p role="status" className={`mt-4 rounded-lg p-3 text-sm font-medium ${msg.ok ? 'bg-leaf-100 text-forest-900' : 'bg-red-50 text-red-700'}`}>{msg.text}</p>}
          <button className="btn btn-primary mt-5 w-full sm:w-auto" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
        </form>
      </Container>
    </section>
  );
}
