import { Check } from 'lucide-react';
import { Container, Heading } from '../Section.jsx';
import { useReveal } from '../../lib/useReveal.js';

const rows = [
  ['Raw materials', 'Manure and mixed waste, seasonal and inconsistent', 'Pure hotel food waste, steady daily supply'],
  ['Production time', 'Slow natural composting, 3 to 6 months', 'Faster processing'],
  ['Cost of production', 'High: paid materials and long labour time', 'Lower: free inputs and efficient processing'],
  ['Traceability', 'Low, hard to trace where inputs came from', 'High: hotel, Ecoplate, farmer'],
  ['Scalability', 'Limited, small volumes', 'High, a continuous waste stream from hotels'],
];

const revenue = [
  { label: 'Fertilizer sales to farmers and cooperatives', pct: 65, cls: 'bg-forest-800' },
  { label: 'Hotels paying for food waste collection', pct: 15, cls: 'bg-leaf-500' },
  { label: 'Sales to agro-processing industries', pct: 10, cls: 'bg-leaf-400' },
  { label: 'Training and workshops on organic fertilizer use', pct: 10, cls: 'bg-soil-500' },
];

const customers = ['Smallholder farmers', 'Agricultural cooperatives', 'Vegetable producers', 'Agro-input retailers'];

export default function Proof() {
  useReveal();
  return (
    <>
      <section id="results" className="bg-forest-900 py-20 text-white sm:py-28">
        <Container>
          <Heading title="Maize grown without Ecoplate, and with it." light>
            We field tested Ecoplate with local farmers. The right-hand side shows maize grown with our fertilizer.
          </Heading>
          <figure className="mt-10">
            <img src="/images/with-without.jpg" alt="Maize grown without Ecoplate on the left, and with Ecoplate on the right" loading="lazy" className="w-full rounded-2xl object-cover" />
            <figcaption className="mt-3 flex justify-between text-sm text-leaf-100"><span>Without Ecoplate</span><span>With Ecoplate</span></figcaption>
          </figure>
        </Container>
      </section>

      <section id="why" className="bg-white py-20 sm:py-28">
        <Container>
          <Heading title="Why farmers and hotels choose Ecoplate">
            Faster than traditional compost, cheaper than imports, and better for the soil than chemical fertilizer.
          </Heading>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-forest-800/15">
            <table className="w-full min-w-[40rem] text-left">
              <thead>
                <tr className="bg-leaf-50 text-forest-900">
                  <th className="p-4 font-semibold">&nbsp;</th>
                  <th className="p-4 font-semibold">Other organic fertilizers</th>
                  <th className="bg-forest-800 p-4 font-semibold text-white">Ecoplate</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([a, b, c]) => (
                  <tr key={a} className="border-t border-forest-800/10 align-top">
                    <th className="p-4 font-semibold text-forest-900">{a}</th>
                    <td className="p-4 text-ink/70">{b}</td>
                    <td className="bg-leaf-50 p-4 font-medium text-forest-900">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-20 grid gap-14 lg:grid-cols-2">
            <div className="reveal">
              <h3 className="text-2xl font-bold text-forest-900">How Ecoplate earns its keep</h3>
              <p className="mt-2 text-ink/70">The plan is to be cash-flow positive in year 2. Here is where the money is expected to come from.</p>
              <div className="mt-6 flex h-5 overflow-hidden rounded-full bg-leaf-50" role="img" aria-label="Revenue split: 65 percent fertilizer sales, 15 percent hotel collection fees, 10 percent agro-processing, 10 percent training">
                {revenue.map((r) => <div key={r.label} className={`grow-x ${r.cls}`} style={{ width: `${r.pct}%` }} />)}
              </div>
              <ul className="mt-5 space-y-3">
                {revenue.map((r) => (
                  <li key={r.label} className="flex items-start gap-3">
                    <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-sm ${r.cls}`} />
                    <span className="flex-1 text-ink/80">{r.label}</span>
                    <span className="font-display font-bold text-forest-900">{r.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-forest-900">Who we serve</h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {customers.map((c) => (
                  <li key={c} className="flex items-center gap-3 rounded-xl bg-leaf-50 px-4 py-3 font-medium text-forest-900"><Check size={18} className="shrink-0 text-forest-600" /> {c}</li>
                ))}
              </ul>
              <p className="mt-6 leading-relaxed text-ink/75">Demand is growing: more farmers care about soil health, chemical fertilizer keeps getting more expensive, and the government supports sustainable agriculture. Our work also creates jobs for young mothers.</p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
