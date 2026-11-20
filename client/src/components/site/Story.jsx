import { Building2, Sprout, Recycle, ArrowRight, ArrowDown, Check } from 'lucide-react';
import { Container, Heading } from '../Section.jsx';
import { Reveal, CountText } from '../Reveal.jsx';

export function Problem({ s }) {
  const { problem } = s;
  return (
    <section className="bg-soil-800 py-20 text-white sm:py-28">
      <Container>
        <Heading title={problem.title} light />
        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-16">
          <Reveal>
            <p className="font-display text-5xl font-extrabold text-leaf-400 sm:text-6xl"><CountText text="64.5 to 70%" /></p>
            <p className="mt-1 text-sm text-soil-100/80">of Rwandans work in agriculture</p>
            <h3 className="mt-6 text-xl font-semibold">On the farm</h3>
            <p className="mt-2 leading-relaxed text-soil-100">{problem.farmers}</p>
          </Reveal>
          <Reveal delay={150}>
            <p className="font-display text-5xl font-extrabold text-leaf-400 sm:text-6xl"><CountText text="1 to 5 tons" /></p>
            <p className="mt-1 text-sm text-soil-100/80">of food waste per hotel, every month</p>
            <h3 className="mt-6 text-xl font-semibold">In the hotel kitchen</h3>
            <p className="mt-2 leading-relaxed text-soil-100">{problem.hotels}</p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

const loop = [
  { icon: Building2, title: 'Hotels', text: 'Sort their food waste and hand it over.' },
  { icon: Recycle, title: 'Ecoplate', text: 'Composts, dries, grinds and packs it.' },
  { icon: Sprout, title: 'Farmers', text: 'Grow more on healthier, cheaper soil.' },
];

export function Loop({ s }) {
  return (
    <section className="bg-leaf-50 py-20 sm:py-24">
      <Container>
        <Heading title="Our answer is a loop" className="mx-auto text-center">{s.problem.solution}</Heading>
        <div className="mt-14 flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          {loop.map((n, i) => (
            <div key={n.title} className="flex flex-1 flex-col items-stretch gap-3 md:flex-row md:items-center">
              <Reveal variant="zoom" delay={i * 160} className="flex-1"><div className="lift h-full rounded-3xl bg-white p-7 text-center shadow-sm">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest-800 text-leaf-400"><n.icon size={26} /></span>
                <h3 className="mt-4 text-xl font-bold text-forest-900">{n.title}</h3>
                <p className="mt-1 text-ink/70">{n.text}</p>
              </div></Reveal>
              {i < loop.length - 1 && (
                <>
                  <ArrowRight className="flow-arrow hidden shrink-0 self-center text-forest-600 md:block" size={28} />
                  <ArrowDown className="flow-arrow mx-auto shrink-0 text-forest-600 md:hidden" size={26} />
                </>
              )}
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-ink/70">And the farmers&rsquo; harvest feeds the hotels again.</p>
      </Container>
    </section>
  );
}

export function Process({ steps }) {
  if (!steps.length) return null;
  const photos = ['/images/hotel-food-buckets.jpg', '/images/worker-sorting.jpg', '/images/waste-bin.jpg', '/images/fertilizer-sample.jpg', '/images/bag-closeup.jpg', '/images/farmers-group.jpg'];
  return (
    <section id="process" className="bg-white py-20 sm:py-28">
      <Container>
        <Heading title="From the hotel kitchen to a 10 kg bag">
          The same careful steps, every time. Quality and safety come before volume.
        </Heading>
        <ol className="mt-14 space-y-12 md:space-y-16">
          {steps.map((st, i) => (
            <li key={st._id} className={`grid items-center gap-6 md:grid-cols-2 md:gap-14 ${i % 2 ? 'md:[&>div:first-child]:order-2' : ''}`}>
              <Reveal variant={i % 2 ? 'right' : 'left'} className="aspect-[16/10] overflow-hidden rounded-2xl bg-leaf-100">
                <img src={photos[i % photos.length]} alt="" loading="lazy" className="h-full w-full object-cover" />
              </Reveal>
              <Reveal delay={120}>
                <span className="font-display text-5xl font-extrabold text-leaf-400">{i + 1}</span>
                <h3 className="mt-1 text-2xl font-bold text-forest-900">{st.title}</h3>
                <p className="mt-2 max-w-md text-lg leading-relaxed text-ink/75">{st.description}</p>
              </Reveal>
            </li>
          ))}
        </ol>
        <p className="mt-14 flex items-start gap-2 rounded-xl bg-leaf-50 p-5 text-forest-900"><Check className="mt-0.5 shrink-0 text-forest-600" size={20} /> Every bag is labelled so it can be traced from the hotel it came from to the farm it went to. We also send samples to the laboratory and work with RAB.</p>
      </Container>
    </section>
  );
}
