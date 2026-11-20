import { Container, Heading } from '../Section.jsx';
import { Reveal } from '../Reveal.jsx';
import { media } from '../../lib/media.js';

export default function About({ s }) {
  const { about, mission, vision } = s;
  return (
    <section id="about" className="bg-white py-20 sm:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <Reveal variant="left" className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="print rotate-[-2deg]">
              <div className="aspect-[4/5] overflow-hidden"><img src={media(about.image)} alt="Ecoplate operator sorting food waste" loading="lazy" /></div>
            </div>
            {about.secondImage && (
              <div className="print absolute -bottom-8 -right-3 w-[52%] rotate-[3deg] sm:-right-8">
                <div className="aspect-[4/3] overflow-hidden"><img src={media(about.secondImage)} alt="Farmers on a hillside" loading="lazy" /></div>
              </div>
            )}
          </Reveal>

          <Reveal delay={150}>
            <Heading title={about.title} />
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink/80">
              {about.body.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </Reveal>
        </div>

        <Reveal variant="zoom" id="mission" className="mt-24 grid gap-px overflow-hidden rounded-2xl bg-forest-800/15 md:grid-cols-2">
          <div className="bg-leaf-50 p-8 sm:p-10">
            <h3 className="text-2xl font-bold text-forest-800">Our mission</h3>
            <p className="mt-3 text-lg leading-relaxed">{mission}</p>
          </div>
          <div className="bg-forest-800 p-8 text-white sm:p-10">
            <h3 className="text-2xl font-bold">Our vision</h3>
            <p className="mt-3 text-lg leading-relaxed text-leaf-100">{vision}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
