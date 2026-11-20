import { Building2, Sprout, Landmark, HandHeart, Briefcase, Handshake, ExternalLink } from 'lucide-react';
import { Container, Heading } from '../Section.jsx';
import { Reveal } from '../Reveal.jsx';
import { media } from '../../lib/media.js';
import { Link } from 'react-router-dom';
import { truncateWords } from '../../lib/text.js';
import { usePagination } from '../../lib/usePagination.js';
import Pagination from '../Pagination.jsx';

const TYPES = {
  hotel: ['Hotel', Building2], farmers: ['Farmers', Sprout], government: ['Government', Landmark],
  ngo: ['NGO', HandHeart], business: ['Business', Briefcase], other: ['Partner', Handshake],
};
const PAGE_SIZE = 6;

export default function Partners({ partners }) {
  const { page, setPage, pageCount, pageItems } = usePagination(partners, PAGE_SIZE);
  return (
    <section id="partners" className="bg-leaf-50 py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <Reveal variant="left">
            <Heading title="People who make the loop work">
              Ecoplate only works because hotels, farmers, institutions and supporters work with us.
            </Heading>
            <div className="mt-8 rounded-2xl bg-forest-800 p-6 text-white">
              <h3 className="text-xl font-bold">Run a hotel or a cooperative?</h3>
              <p className="mt-2 text-leaf-100">We are looking for hotels that want their food waste to do some good, and farmer groups that want affordable organic fertilizer.</p>
              <Link to="/#contact" className="btn btn-lime mt-5">Become a partner</Link>
            </div>
          </Reveal>

          {partners.length > 0 ? (
            <>
              <ul className="grid content-start gap-4 sm:grid-cols-2">
                {pageItems.map((p, i) => {
                  const [label, Icon] = TYPES[p.type] || TYPES.other;
                  return (
                    <Reveal as="li" key={p._id} delay={(i % 2) * 120} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
                      {p.logo ? (
                        <img src={media(p.logo)} alt="" className="h-14 w-14 shrink-0 rounded-xl object-contain" loading="lazy" />
                      ) : (
                        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-leaf-100 text-forest-800"><Icon size={26} /></span>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-forest-600">{label}</p>
                        <h3 className="font-display text-lg font-bold leading-snug text-forest-900">{p.name}</h3>
                        {p.description && <p className="mt-1 text-sm leading-relaxed text-ink/70">{truncateWords(p.description, 35)}</p>}
                        {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-forest-700 underline underline-offset-2">Visit website <ExternalLink size={13} /></a>}
                      </div>
                    </Reveal>
                  );
                })}
              </ul>
              <Pagination page={page} pageCount={pageCount} setPage={setPage} total={partners.length} pageSize={PAGE_SIZE} />
            </>
          ) : (
            <p className="self-center text-lg text-ink/70">Our first partners will appear here soon.</p>
          )}
        </div>
      </Container>
    </section>
  );
}
