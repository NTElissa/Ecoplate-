import { useCallback, useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Container, Heading } from '../Section.jsx';
import { media } from '../../lib/media.js';
import Pagination from '../Pagination.jsx';
import { usePagination } from '../../lib/usePagination.js';

const CATS = { waste: 'Hotel waste', process: 'Our process', product: 'The product', farmers: 'With farmers', team: 'The team' };
const PAGE_SIZE = 12;

export default function Gallery({ items }) {
  const [cat, setCat] = useState('all');
  const [idx, setIdx] = useState(null);
  const cats = Object.keys(CATS).filter((c) => items.some((i) => i.category === c));
  const list = cat === 'all' ? items : items.filter((i) => i.category === cat);
  const { page, setPage, pageCount, pageItems } = usePagination(list, PAGE_SIZE);

  const close = useCallback(() => setIdx(null), []);
  const step = useCallback((d) => setIdx((i) => (i === null ? i : (i + d + list.length) % list.length)), [list.length]);

  useEffect(() => {
    if (idx === null) return;
    const k = (e) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); };
    document.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [idx, close, step]);

  if (!items.length) return null;
  const cur = idx !== null ? list[idx] : null;

  return (
    <section id="gallery" className="bg-paper py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Heading title="Photos from our work">Straight from the yard, the hotels and the fields. Tap a photo to see it larger.</Heading>
          <div className="flex flex-wrap gap-2">
            {['all', ...cats].map((c) => (
              <button key={c} onClick={() => { setCat(c); setPage(1); setIdx(null); }} aria-pressed={cat === c}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${cat === c ? 'bg-forest-800 text-white' : 'bg-white text-forest-800 hover:bg-leaf-100'}`}>{c === 'all' ? 'All' : CATS[c]}</button>
            ))}
          </div>
        </div>

        <div className="mt-10 columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
          {pageItems.map((g, i) => (
            <button key={g._id} onClick={() => setIdx(list.findIndex((item) => item._id === g._id))} className="reveal reveal-zoom group mb-3 block w-full overflow-hidden rounded-xl bg-leaf-100 sm:mb-4" style={{ '--d': `${(i % 4) * 70}ms` }} aria-label={`Open photo: ${g.title || 'Ecoplate'}`}>
              <img src={media(g.image)} alt={g.title || g.caption || 'Ecoplate photo'} loading="lazy" className="w-full transition-transform duration-500 group-hover:scale-105" />
            </button>
          ))}
        </div>
        <Pagination page={page} pageCount={pageCount} setPage={setPage} total={list.length} pageSize={PAGE_SIZE} />
      </Container>

      {cur && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-black/90" role="dialog" aria-modal="true" onClick={close}>
          <div className="flex justify-end p-3"><button onClick={close} className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Close"><X size={28} /></button></div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => step(-1)} className="absolute left-1 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 sm:left-4" aria-label="Previous"><ChevronLeft size={28} /></button>
            <img src={media(cur.image)} alt={cur.title || ''} className="max-h-full max-w-full rounded-lg object-contain" />
            <button onClick={() => step(1)} className="absolute right-1 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 sm:right-4" aria-label="Next"><ChevronRight size={28} /></button>
          </div>
          <div className="p-5 text-center text-white" onClick={(e) => e.stopPropagation()}>
            {cur.title && <p className="font-display text-lg font-semibold">{cur.title}</p>}
            {cur.caption && <p className="text-sm text-white/75">{cur.caption}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
