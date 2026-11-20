import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, MessageCircle } from 'lucide-react';
import { Container } from '../Section.jsx';
import { api } from '../../lib/api.js';

const nav = [['About', '/#about'], ['How it works', '/how-it-works#process'], ['Goals', '/#goals'], ['Projects', '/#projects'], ['Gallery', '/gallery'], ['Field results', '/how-it-works#results'], ['Partners', '/#partners'], ['News', '/news'], ['Donate', '/donate'], ['Contact', '/#contact']];

export default function Footer({ s }) {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const social = Object.entries(s.social || {}).filter(([, v]) => v);

  async function join(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.subscribe({ email });
      setMsg({ ok: true, text: r.message });
      setEmail('');
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <footer className="bg-forest-900 pb-8 pt-16 text-leaf-100">
        <Container>
          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1.2fr]">
            <div>
              <div className="flex items-center gap-3">
                <img src="/images/logo.jpg" alt="" className="h-12 w-12 rounded-full" />
                <span className="font-display text-2xl font-bold text-white">{s.brand.name}</span>
              </div>
              <p className="mt-4 max-w-xs">{s.footer.note}</p>
              <p className="mt-2 text-sm text-leaf-100/70">{s.brand.location}</p>
              {social.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {social.map(([k, v]) => <li key={k}><a href={v} target="_blank" rel="noopener noreferrer" className="rounded-full border border-leaf-100/30 px-3.5 py-1.5 text-sm font-medium capitalize hover:bg-white/10">{k}</a></li>)}
                </ul>
              )}
            </div>
            <nav aria-label="Footer"><ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">{nav.map(([t, h]) => <li key={h}><Link to={h} className="hover:text-white hover:underline">{t}</Link></li>)}</ul></nav>
            <div>
              <h3 className="text-lg font-bold text-white">News in your inbox</h3>
              <p className="mt-1 text-sm text-leaf-100/80">Occasional updates on production, harvests and how to help. No spam.</p>
              <form onSubmit={join} className="mt-4 flex gap-2">
                <label className="sr-only" htmlFor="news-email">Email address</label>
                <input id="news-email" className="input !border-transparent" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button className="btn btn-lime shrink-0 !px-5" disabled={busy}>Join</button>
              </form>
              {msg && <p role="status" className={`mt-2 text-sm ${msg.ok ? 'text-leaf-400' : 'text-red-300'}`}>{msg.text}</p>}
            </div>
          </div>
          <p className="mt-12 border-t border-white/10 pt-6 text-sm text-leaf-100/60">&copy; {new Date().getFullYear()} {s.brand.name}. Made in Karongi, Rwanda.</p>
        </Container>
      </footer>

      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top" className="grid h-11 w-11 place-items-center rounded-full bg-white text-forest-800 shadow-lg hover:bg-leaf-100"><ArrowUp size={20} /></button>
        {s.contact.whatsapp && (
          <a href={`https://wa.me/${s.contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hello Ecoplate, I would like to know more.')}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#25a244] px-4 py-3 font-semibold text-white shadow-lg hover:bg-[#1f8c3a]"><MessageCircle size={20} /> <span className="hidden sm:inline">Chat on WhatsApp</span><span className="sr-only sm:hidden">Chat on WhatsApp</span></a>
        )}
      </div>
    </>
  );
}
