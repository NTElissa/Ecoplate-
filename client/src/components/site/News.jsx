import { useState } from 'react';
import { Pin } from 'lucide-react';
import { Container, Heading } from '../Section.jsx';
import { media } from '../../lib/media.js';
import { date } from '../../lib/format.js';
import { truncateWords } from '../../lib/text.js';
import { usePagination } from '../../lib/usePagination.js';
import Pagination from '../Pagination.jsx';

const CAT = { news: 'News', funding: 'Funding', production: 'Production', event: 'Event', notice: 'Notice' };
const PAGE_SIZE = 8;

export default function News({ items }) {
  const [openId, setOpenId] = useState(null);
  const [leadOpen, setLeadOpen] = useState(false);
  const { page, setPage, pageCount, pageItems } = usePagination(items, PAGE_SIZE);
  if (!items.length) return null;
  const [lead, ...rest] = pageItems;

  return (
    <section id="news" className="bg-white py-20 sm:py-28">
      <Container>
        <Heading title="Announcements">What is new at Ecoplate.</Heading>

        <article className="reveal reveal-zoom mt-10 overflow-hidden rounded-3xl bg-paper lg:grid lg:grid-cols-[1.1fr_1fr]">
          {lead.image && <img src={media(lead.image)} alt="" className="h-64 w-full object-cover lg:h-full" loading="lazy" />}
          <div className="p-7 sm:p-10">
            <p className="flex items-center gap-2 text-sm font-semibold text-forest-600">
              {lead.pinned && <Pin size={14} />} {CAT[lead.category]} on {date(lead.publishedAt)}
            </p>
            <h3 className="mt-3 text-2xl font-bold leading-snug text-forest-900 sm:text-3xl">{lead.title}</h3>
            <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-ink/80">{leadOpen ? lead.body : truncateWords(lead.body, 45)}</p>
            {truncateWords(lead.body, 45) !== lead.body && (
              <button onClick={() => setLeadOpen(!leadOpen)} className="mt-3 font-semibold text-forest-700 underline underline-offset-2">{leadOpen ? 'Show less' : 'Read more'}</button>
            )}
          </div>
        </article>

        {rest.length > 0 && (
          <ul className="mt-6 divide-y divide-forest-800/10 border-y border-forest-800/10">
            {rest.map((n, i) => {
              const open = openId === n._id;
              return (
                <li key={n._id} className="reveal" style={{ '--d': `${i * 80}ms` }}>
                  <button onClick={() => setOpenId(open ? null : n._id)} aria-expanded={open} className="flex w-full flex-col gap-1 py-5 text-left sm:flex-row sm:items-baseline sm:gap-8">
                    <span className="w-36 shrink-0 text-sm font-semibold text-forest-600">{date(n.publishedAt)}</span>
                    <span className="flex-1">
                      <span className="block font-display text-xl font-bold text-forest-900">{n.title}</span>
                      {!open && <span className="mt-1 block text-sm leading-relaxed text-ink/65">{truncateWords(n.body, 24)}</span>}
                      {open && (
                        <span className="mt-3 flex flex-col gap-4 sm:flex-row">
                          {n.image && <img src={media(n.image)} alt="" className="h-40 w-full rounded-xl object-cover sm:w-56" />}
                          <span className="whitespace-pre-line leading-relaxed text-ink/75">{n.body}</span>
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-semibold text-forest-700 underline underline-offset-2">{open ? 'Show less' : 'Read'}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <Pagination page={page} pageCount={pageCount} setPage={setPage} total={items.length} pageSize={PAGE_SIZE} />
      </Container>
    </section>
  );
}
