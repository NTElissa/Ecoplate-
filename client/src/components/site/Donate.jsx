import { useState } from 'react';
import { Heart, Copy, Check, Smartphone } from 'lucide-react';
import { Container } from '../Section.jsx';
import { api } from '../../lib/api.js';
import { money } from '../../lib/format.js';

export default function Donate({ s, stats }) {
  const d = s.donation;
  const [amount, setAmount] = useState(d.suggested?.[1] || 10000);
  const [custom, setCustom] = useState('');
  const [form, setForm] = useState({ donorName: '', email: '', phone: '', message: '', anonymous: false, method: 'momo' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);
  const [copied, setCopied] = useState(false);

  const value = custom ? Number(custom) : amount;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const pct = d.target > 0 ? Math.min(100, Math.round((stats.raised / d.target) * 100)) : 0;

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      setDone(await api.donate({ ...form, amount: value }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  }

  return (
    <section id="donate" className="relative overflow-hidden bg-forest-800 py-20 text-white sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div className="reveal reveal-left">
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-[2.75rem]">{d.title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-leaf-100">{d.intro}</p>

          <h3 className="mt-8 text-lg font-bold">Where your gift goes</h3>
          <ul className="mt-3 space-y-2.5">
            {d.uses.map((u) => (
              <li key={u} className="flex items-start gap-3 text-leaf-100"><Check size={18} className="mt-1 shrink-0 text-leaf-400" /> {u}</li>
            ))}
          </ul>

          {(d.target > 0 || stats.raised > 0) && (
            <div className="mt-8 rounded-2xl bg-white/10 p-5">
              <p className="font-display text-3xl font-bold">{money(stats.raised, d.currency)}</p>
              <p className="text-sm text-leaf-100">{d.target > 0 ? `raised of ${money(d.target, d.currency)} goal` : 'raised so far'}, from {stats.count} {stats.count === 1 ? 'gift' : 'gifts'}</p>
              {d.target > 0 && (
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-leaf-400" style={{ width: `${pct}%` }} />
                </div>
              )}
              {stats.donors.length > 0 && <p className="mt-3 text-sm text-leaf-100">Thank you, {stats.donors.slice(0, 5).join(', ')}{stats.donors.length > 5 ? ' and others' : ''}.</p>}
            </div>
          )}
          <img src="/images/farmers-group.jpg" alt="Farmers holding a bag of Ecoplate" className="mt-8 hidden h-56 w-full rounded-2xl object-cover lg:block" loading="lazy" />
        </div>

        <div className="reveal reveal-right rounded-3xl bg-white p-6 text-ink shadow-xl sm:p-8">
          {done ? (
            <div>
              <span className="grid h-14 w-14 place-items-center rounded-full bg-leaf-100 text-forest-800"><Heart size={26} /></span>
              <h3 className="mt-4 text-2xl font-bold text-forest-900">Thank you, {form.donorName.split(' ')[0]}.</h3>
              <p className="mt-2 text-ink/75">Your gift of <strong>{money(done.amount, done.currency)}</strong> is noted. One more step: send it by mobile money so we can confirm it.</p>

              <div className="mt-5 space-y-3 rounded-2xl bg-leaf-50 p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-forest-700"><Smartphone size={16} /> Mobile money number</p>
                <p className="font-display text-3xl font-bold text-forest-900">{d.momoNumber}</p>
                <p className="text-sm text-ink/70">Name on the account: {d.momoName}</p>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-white p-3">
                  <div><p className="text-xs text-ink/60">Your reference code</p><p className="font-display text-xl font-bold tracking-wide text-forest-900">{done.reference}</p></div>
                  <button onClick={() => copy(done.reference)} className="btn btn-outline !px-4 !py-2 text-forest-800">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}</button>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink/70">{d.instructions}</p>
              <button onClick={() => { setDone(null); setCustom(''); setForm((f) => ({ ...f, message: '' })); }} className="mt-5 font-semibold text-forest-700 underline underline-offset-2">Make another gift</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <h3 className="text-2xl font-bold text-forest-900">Make a gift</h3>
              <fieldset className="mt-5">
                <legend className="mb-2 text-sm font-semibold">Choose an amount ({d.currency})</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {d.suggested.map((a) => (
                    <button type="button" key={a} onClick={() => { setAmount(a); setCustom(''); }} aria-pressed={!custom && amount === a}
                      className={`rounded-xl border-2 px-2 py-3 font-display font-bold transition-colors ${!custom && amount === a ? 'border-forest-800 bg-forest-800 text-white' : 'border-forest-800/20 text-forest-900 hover:border-forest-800'}`}>
                      {new Intl.NumberFormat('en-US').format(a)}
                    </button>
                  ))}
                </div>
                <label className="field mt-3 block"><span>Or another amount</span>
                  <input className="input" inputMode="numeric" placeholder="e.g. 15000" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))} />
                </label>
              </fieldset>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="field"><span>Your name</span><input className="input" required autoComplete="name" value={form.donorName} onChange={set('donorName')} /></label>
                <label className="field"><span>Phone</span><input className="input" type="tel" autoComplete="tel" placeholder="07xx xxx xxx" value={form.phone} onChange={set('phone')} /></label>
                <label className="field sm:col-span-2"><span>Email</span><input className="input" type="email" autoComplete="email" value={form.email} onChange={set('email')} /></label>
                <label className="field sm:col-span-2"><span>A message for the team (optional)</span><textarea className="input" rows={2} maxLength={600} value={form.message} onChange={set('message')} /></label>
              </div>

              <label className="mt-4 flex items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-forest-800" checked={form.anonymous} onChange={set('anonymous')} /> Keep my name off the public thank-you list</label>

              {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
              <button className="btn btn-primary mt-6 w-full !py-4 text-lg" disabled={busy}>{busy ? 'Sending…' : `Give ${value ? money(value, d.currency) : ''}`}</button>
              <p className="mt-3 text-center text-xs text-ink/60">You will get a reference code and the mobile money number on the next screen.</p>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
