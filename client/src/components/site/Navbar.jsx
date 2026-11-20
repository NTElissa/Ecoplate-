import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, ChevronDown, Phone, MessageCircle, Moon, Sun, ArrowUpRight } from 'lucide-react';
import { Container } from '../Section.jsx';
import ThemeToggle from '../ThemeToggle.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

const how = [
  { label: 'The process', to: '/how-it-works#process', desc: 'Six steps from hotel kitchen to bag' },
  { label: 'Field results', to: '/how-it-works#results', desc: 'Maize with and without Ecoplate' },
];

const links = [
  { label: 'About', to: '/#about', desc: 'Who we are and why' },
  { label: 'Projects', to: '/#projects', desc: 'What we are building' },
  { label: 'Gallery', to: '/gallery', desc: 'Photos from the field' },
  { label: 'Partners', to: '/#partners', desc: 'Hotels, farmers, institutions' },
  { label: 'News', to: '/news', desc: 'Announcements' },
  { label: 'Contact', to: '/#contact', desc: 'Talk to a real person' },
];

const SPY_IDS = ['about', 'projects', 'partners', 'contact'];

// Which section of the home page is on screen, so the menu can highlight it.
function useSpy(enabled) {
  const [id, setId] = useState('');
  useEffect(() => {
    if (!enabled) { setId(''); return; }
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      const best = [...seen.entries()].sort((a, b) => b[1] - a[1])[0];
      setId(best && best[1] > 0 ? best[0] : '');
    }, { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.2, 0.6, 1] });
    const t = setTimeout(() => SPY_IDS.forEach((s) => { const el = document.getElementById(s); if (el) io.observe(el); }), 400);
    return () => { clearTimeout(t); io.disconnect(); };
  }, [enabled]);
  return id;
}

export default function Navbar({ contact }) {
  const { pathname, hash } = useLocation();
  const { dark, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const closeRef = useRef(null);
  const menuRef = useRef(null);
  const spy = useSpy(pathname === '/');

  const isActive = (to) => {
    const [p, h] = to.split('#');
    if (!h) return pathname === p;
    if (p === '/' || p === '') return pathname === '/' && spy === h;
    return pathname === p && (hash === `#${h}` || (!hash && h === 'process'));
  };
  const howActive = pathname === '/how-it-works';

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  // close everything whenever the page or section changes
  useEffect(() => { setOpen(false); setHowOpen(false); }, [pathname, hash]);

  // lock page scroll behind the mobile menu and let Escape close it
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) closeRef.current?.focus();
    const key = (e) => { if (e.key === 'Escape') { setOpen(false); setHowOpen(false); } };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', key); };
  }, [open]);

  // close the desktop dropdown when clicking elsewhere
  useEffect(() => {
    if (!howOpen) return;
    const away = (e) => { if (!menuRef.current?.contains(e.target)) setHowOpen(false); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [howOpen]);

  const linkCls = (active) =>
    `relative py-1 text-[15px] font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-leaf-500 after:transition-transform ${
      active ? 'text-forest-900 after:scale-x-100' : 'text-forest-900/75 after:scale-x-0 hover:text-forest-900 hover:after:scale-x-100'
    }`;

  const phone = contact?.phone;
  const wa = contact?.whatsapp?.replace(/\D/g, '');

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${solid ? 'bg-paper/90 shadow-[0_1px_0_rgb(20_50_32/0.08)] backdrop-blur-md' : 'bg-transparent'}`}>
        <Container className={`flex items-center justify-between gap-3 transition-[height] duration-300 ${solid ? 'h-14' : 'h-16'}`}>
          <Link to="/" className="flex items-center gap-2.5" aria-label="Ecoplate home">
            <img src="/images/logo.jpg" alt="" className="h-9 w-9 rounded-full sm:h-10 sm:w-10" />
            <span className="font-display text-xl font-bold text-forest-900">Ecoplate</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            <div ref={menuRef} className="relative" onMouseEnter={() => setHowOpen(true)} onMouseLeave={() => setHowOpen(false)}>
              <button type="button" onClick={() => setHowOpen((v) => !v)} aria-expanded={howOpen} aria-haspopup="true" className={`flex items-center gap-1 ${linkCls(howActive)}`}>
                How it works <ChevronDown size={15} className={`transition-transform duration-200 ${howOpen ? 'rotate-180' : ''}`} />
              </button>
              {howOpen && (
                <div className="sheet-in absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-3">
                  <div className="rounded-2xl bg-white p-2 shadow-xl ring-1 ring-forest-900/10">
                    {how.map((h) => (
                      <Link key={h.to} to={h.to} className="group block rounded-xl px-4 py-3 hover:bg-leaf-50">
                        <span className="flex items-center justify-between font-semibold text-forest-900">{h.label}<ArrowUpRight size={15} className="text-forest-600 opacity-0 transition-opacity group-hover:opacity-100" /></span>
                        <span className="text-sm text-ink/60">{h.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {links.map((l) => <Link key={l.to} to={l.to} className={linkCls(isActive(l.to))} aria-current={isActive(l.to) ? 'page' : undefined}>{l.label}</Link>)}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle className="hidden lg:grid" />
            <Link to="/donate" className="btn btn-primary !px-4 !py-2.5 text-sm sm:text-base"><Heart size={16} className="beat" /> Donate</Link>
            <button className="grid h-11 w-11 place-items-center rounded-full text-forest-900 hover:bg-leaf-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu">
              <Menu size={26} />
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile menu: a full-screen sheet */}
      {open && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-forest-900 text-white lg:hidden" style={{ height: '100dvh' }}>
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-leaf-400/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-[60%_40%_55%_45%] bg-leaf-400/10" />

          <div className="relative flex h-16 shrink-0 items-center justify-between px-5">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/images/logo.jpg" alt="" className="h-9 w-9 rounded-full" />
              <span className="font-display text-xl font-bold">Ecoplate</span>
            </Link>
            <button ref={closeRef} onClick={() => setOpen(false)} aria-label="Close menu" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20"><X size={24} /></button>
          </div>

          <nav className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-3 pt-1" aria-label="Mobile">
            <div className="rise border-b border-white/10 py-3" style={{ '--d': '40ms' }}>
              <Link to="/how-it-works#process" className={`flex items-baseline justify-between font-display text-[1.7rem] font-bold leading-tight ${howActive ? 'text-leaf-400' : ''}`}>How it works</Link>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {how.map((h) => (
                  <Link key={h.to} to={h.to} className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${isActive(h.to) ? 'border-leaf-400 bg-leaf-400 text-forest-900' : 'border-white/25 text-leaf-100'}`}>{h.label}</Link>
                ))}
              </div>
            </div>
            {links.map((l, i) => {
              const on = isActive(l.to);
              return (
                <Link key={l.to} to={l.to} aria-current={on ? 'page' : undefined} className="rise group flex items-center justify-between border-b border-white/10 py-3" style={{ '--d': `${110 + i * 55}ms` }}>
                  <span>
                    <span className={`block font-display text-[1.7rem] font-bold leading-tight ${on ? 'text-leaf-400' : ''}`}>{l.label}</span>
                    <span className="text-sm text-leaf-100/65">{l.desc}</span>
                  </span>
                  <ArrowUpRight size={22} className={on ? 'text-leaf-400' : 'text-white/35'} />
                </Link>
              );
            })}
          </nav>

          <div className="rise relative shrink-0 space-y-3 border-t border-white/10 bg-forest-900 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4" style={{ '--d': '480ms' }}>
            <Link to="/donate" className="btn btn-lime w-full !py-4 text-lg"><Heart size={19} className="beat" /> Donate to Ecoplate</Link>
            <div className="grid grid-cols-3 gap-2">
              {phone ? <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex flex-col items-center gap-1 rounded-xl bg-white/10 py-3 text-sm font-medium hover:bg-white/15"><Phone size={19} /> Call</a> : <span />}
              {wa ? <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 rounded-xl bg-white/10 py-3 text-sm font-medium hover:bg-white/15"><MessageCircle size={19} /> WhatsApp</a> : <span />}
              <button type="button" onClick={toggleTheme} aria-pressed={dark} className="flex flex-col items-center gap-1 rounded-xl bg-white/10 py-3 text-sm font-medium hover:bg-white/15">{dark ? <Sun size={19} /> : <Moon size={19} />}{dark ? 'Light' : 'Dark'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
