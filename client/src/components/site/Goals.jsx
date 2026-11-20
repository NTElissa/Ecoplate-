import { Target } from 'lucide-react';
import { Container, Heading } from '../Section.jsx';
import { Reveal } from '../Reveal.jsx';

export default function Goals({ goals }) {
  const objectives = goals.filter((g) => g.kind === 'objective');
  const milestones = goals.filter((g) => g.kind === 'milestone');
  if (!objectives.length && !milestones.length) return null;

  return (
    <section id="goals" className="bg-leaf-50 py-20 sm:py-28">
      <Container>
        <Heading title="What we are working towards">
          Five goals for the pilot, and a twelve month plan to get there.
        </Heading>

        <div className="mt-12 grid gap-14 lg:grid-cols-2 lg:gap-20">
          <ul className="space-y-6">
            {objectives.map((g, i) => (
              <Reveal as="li" key={g._id} delay={i * 90} className="flex gap-4">
                <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest-800 text-leaf-400"><Target size={18} /></span>
                <div>
                  <h3 className="text-xl font-bold text-forest-900">{g.title}</h3>
                  {g.description && <p className="mt-1 leading-relaxed text-ink/75">{g.description}</p>}
                </div>
              </Reveal>
            ))}
          </ul>

          {milestones.length > 0 && (
            <div>
              <h3 className="mb-6 text-2xl font-bold text-forest-900">The next twelve months</h3>
              <ol className="relative space-y-8 border-l-2 border-forest-800/25 pl-8">
                {milestones.map((m, i) => (
                  <Reveal as="li" key={m._id} delay={i * 140} variant="right" className="relative">
                    <span className="absolute -left-[2.62rem] top-1.5 h-4 w-4 rounded-full border-4 border-leaf-50 bg-forest-800" />
                    {m.phase && <p className="text-sm font-bold text-forest-600">{m.phase}</p>}
                    <h4 className="text-xl font-bold text-forest-900">{m.title}</h4>
                    {m.description && <p className="mt-1 leading-relaxed text-ink/75">{m.description}</p>}
                  </Reveal>
                ))}
              </ol>
              <p className="mt-8 rounded-xl bg-white p-4 text-sm text-ink/70">We will measure our progress by production volume, waste reduced, farmers served, crop results and revenue.</p>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
