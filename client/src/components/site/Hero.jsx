import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Container } from '../Section.jsx';
import { Words } from '../Reveal.jsx';
import { media } from '../../lib/media.js';

const ORDER = ['farmers', 'process', 'product', 'waste', 'team'];
const SKIP = /with-without|poster|flyer|logo/;
const DURATION = 5500;

// The hero photo first, then one photo from each gallery category so the reel shows the whole story.
function buildSlides(hero, gallery = []) {
  const usable = gallery.filter((g) => g.image && !SKIP.test(g.image));
  const lead = usable.find((g) => g.image === hero.image);
  const slides = [{ src: hero.image, caption: lead?.title || 'Talking soil with farmers in Karongi' }];
  const seen = new Set([hero.image]);
  const add = (g) => { if (!seen.has(g.image) && slides.length < 6) { seen.add(g.image); slides.push({ src: g.image, caption: g.title || g.caption || '' }); } };
  ORDER.forEach((c) => { const g = usable.find((x) => x.category === c && !seen.has(x.image)); if (g) add(g); });
  usable.forEach(add);
  return slides;
}

export default function Hero({ s, gallery }) {
  const { hero, brand } = s;
  const slides = useMemo(() => buildSlides(hero, gallery), [hero, gallery]);
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState(-1);
  const [paused, setPaused] = useState(false);
  const n = slides.length;

  const go = useCallback((to) => { setPrev(i); setI(((to % n) + n) % n); }, [i, n]);
  const next = useCallback(() => go(i + 1), [go, i]);

  return (
    <section id="top" className="relative overflow-hidden bg-paper pt-24 sm:pt-28">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-24 hidden h-96 w-96 rounded-[55%_45%_60%_40%] bg-leaf-100/70 lg:block" />
      <Container className="relative grid items-center gap-12 pb-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-28">
        <div>
          <p className="rise mb-5 inline-flex items-center gap-2 rounded-full bg-leaf-100 px-3.5 py-1.5 text-sm font-semibold text-forest-800" style={{ '--d': '60ms' }}>
            <MapPin size={15} /> {brand.location}
          </p>
          <h1 className="text-[2.45rem] font-extrabold leading-[1.06] text-forest-900 sm:text-6xl lg:text-[4.1rem]"><Words text={hero.title} start={160} /></h1>
          <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-ink/80 sm:text-xl" style={{ '--d': '700ms' }}>{hero.subtitle}</p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ '--d': '850ms' }}>
            <Link to="/donate" className="btn btn-primary w-full sm:w-auto">{hero.primaryCta}</Link>
            <Link to="/how-it-works#process" className="btn btn-outline w-full text-forest-800 sm:w-auto">{hero.secondaryCta}</Link>
          </div>
          <p className="rise mt-8 max-w-md text-sm text-ink/60" style={{ '--d': '1000ms' }}>Registered business. Pilot production running. Prize grant of RWF 4,000,000 received.</p>
        </div>

        {/* photo reel */}
        <div className="rise relative mx-auto w-full max-w-lg lg:max-w-none" style={{ '--d': '300ms' }}
          onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
          <div className="leaf-frame relative aspect-[4/4.3] bg-leaf-100 shadow-[0_30px_60px_-30px_rgb(20_50_32/0.55)] sm:aspect-[4/3.6] lg:aspect-[4/4.5]" aria-roledescription="carousel" aria-label="Photos of Ecoplate at work">
            {slides.map((sl, k) => (
              <div key={sl.src} className={`slide ${k === i ? 'active' : k === prev ? 'prev' : ''}`} aria-hidden={k !== i}>
                <img src={media(sl.src)} alt={sl.caption} loading={k < 2 ? 'eager' : 'lazy'} fetchPriority={k === 0 ? 'high' : undefined} />
              </div>
            ))}
            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-forest-900/75 to-transparent px-6 pb-5 pt-14 text-white sm:px-8 lg:pl-28">
              <p key={i} className="rise text-sm font-medium sm:text-base" style={{ '--d': '350ms' }} aria-live="polite">{slides[i].caption}</p>
            </div>
          </div>

          {n > 1 && (
            <div className={`mt-4 flex items-center gap-3 lg:pl-28 ${paused ? 'reel-paused' : ''}`}>
              <div className="flex flex-1 gap-1.5" role="tablist" aria-label="Choose photo">
                {slides.map((sl, k) => (
                  <button key={sl.src} role="tab" aria-selected={k === i} aria-label={`Photo ${k + 1}`} onClick={() => go(k)} className="group h-6 flex-1">
                    <span className="block h-1 overflow-hidden rounded-full bg-forest-900/15">
                      {k === i ? (
                        <span key={`${i}-${slides.length}`} className="reel-fill block h-full rounded-full bg-forest-800" style={{ '--dur': `${DURATION}ms` }} onAnimationEnd={next} />
                      ) : (
                        <span className={`block h-full rounded-full bg-forest-800 transition-transform duration-500 ${k < i ? 'scale-x-100' : 'scale-x-0'}`} style={{ transformOrigin: 'left' }} />
                      )}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                <button onClick={() => go(i - 1)} aria-label="Previous photo" className="grid h-9 w-9 place-items-center rounded-full border border-forest-800/25 text-forest-800 hover:bg-leaf-100"><ChevronLeft size={18} /></button>
                <button onClick={() => go(i + 1)} aria-label="Next photo" className="grid h-9 w-9 place-items-center rounded-full border border-forest-800/25 text-forest-800 hover:bg-leaf-100"><ChevronRight size={18} /></button>
              </div>
            </div>
          )}

          <div className="print drift absolute -bottom-6 -left-3 z-20 hidden w-[27%] sm:block lg:-left-10" style={{ '--r': '-4deg', transform: 'rotate(-4deg)' }}>
            <div className="aspect-[3/4] overflow-hidden"><img src="/images/bag-closeup.jpg" alt="A 10 kg bag of Ecoplate natural organic fertilizer" /></div>
          </div>
          <img src="/images/logo.jpg" alt="Ecoplate seal" className="spin-slow absolute -right-2 -top-7 z-20 h-20 w-20 rounded-full border-4 border-paper shadow-lg sm:-right-4 sm:h-24 sm:w-24" />
        </div>
      </Container>
    </section>
  );
}
