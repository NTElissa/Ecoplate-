import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Container, Heading } from '../Section.jsx';
import { Reveal } from '../Reveal.jsx';
import { media } from '../../lib/media.js';
import Pagination from '../Pagination.jsx';
import { usePagination } from '../../lib/usePagination.js';
import { truncateWords } from '../../lib/text.js';

const STATUS = {
  ongoing: { label: 'Ongoing', cls: 'bg-leaf-400 text-forest-900' },
  completed: { label: 'Completed', cls: 'bg-forest-800 text-white' },
  planned: { label: 'Coming up', cls: 'bg-soil-100 text-soil-800' },
};
const PAGE_SIZE = 7;

function Badge({ status }) {
  const s = STATUS[status] || STATUS.ongoing;
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span>;
}

function Modal({ project, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] grid place-items-end bg-black/60 p-0 sm:place-items-center sm:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-label={project.title}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        {project.image && <img src={media(project.image)} alt="" className="aspect-[16/9] w-full object-cover" />}
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-2xl font-bold text-forest-900 sm:text-3xl">{project.title}</h3>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-leaf-50" aria-label="Close"><X /></button>
          </div>
          <div className="mt-2"><Badge status={project.status} /></div>
          <div className="mt-5 space-y-3 text-lg leading-relaxed text-ink/80">
            {(project.description || project.summary).split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects({ projects }) {
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(null);
  if (!projects.length) return null;

  const tabs = [['all', 'All'], ['ongoing', 'Ongoing'], ['completed', 'Completed'], ['planned', 'Coming up']].filter(
    ([k]) => k === 'all' || projects.some((p) => p.status === k)
  );
  const list = filter === 'all' ? projects : projects.filter((p) => p.status === filter);
  const { page, setPage, pageCount, pageItems } = usePagination(list, PAGE_SIZE);
  const [first, ...rest] = pageItems;

  return (
    <section id="projects" className="bg-white py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Heading title="Our projects">What we are doing right now, what we have finished, and what comes next.</Heading>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter projects">
            {tabs.map(([k, l]) => (
              <button key={k} role="tab" aria-selected={filter === k} onClick={() => { setFilter(k); setPage(1); }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${filter === k ? 'bg-forest-800 text-white' : 'bg-leaf-50 text-forest-800 hover:bg-leaf-100'}`}>{l}</button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {first && (
            <Reveal key={first._id} variant="zoom" className="md:col-span-3">
            <button onClick={() => setOpen(first)} className="group relative w-full overflow-hidden rounded-3xl bg-forest-900 text-left md:grid md:grid-cols-2">
              <div className="aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[22rem]">
                {first.image && <img src={media(first.image)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
              </div>
              <div className="flex flex-col justify-center p-7 text-white sm:p-10">
                <span className="self-start"><Badge status={first.status} /></span>
                <h3 className="mt-4 text-2xl font-bold sm:text-3xl">{first.title}</h3>
                <p className="mt-3 text-leaf-100">{truncateWords(first.summary, 35)}</p>
                <span className="mt-5 font-semibold text-leaf-400 underline underline-offset-4">Read more</span>
              </div>
            </button>
            </Reveal>
          )}
          {rest.map((p, i) => (
            <Reveal key={p._id} delay={(i % 3) * 110}>
            <button onClick={() => setOpen(p)} className="group lift h-full w-full overflow-hidden rounded-2xl border border-forest-800/10 bg-paper text-left">
              <div className="aspect-[4/3] overflow-hidden bg-leaf-100">
                {p.image && <img src={media(p.image)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
              </div>
              <div className="p-5">
                <Badge status={p.status} />
                <h3 className="mt-3 text-xl font-bold leading-snug text-forest-900">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/70">{truncateWords(p.summary, 24)}</p>
              </div>
            </button>
            </Reveal>
          ))}
        </div>
        <Pagination page={page} pageCount={pageCount} setPage={setPage} total={list.length} pageSize={PAGE_SIZE} />
      </Container>
      {open && <Modal project={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
