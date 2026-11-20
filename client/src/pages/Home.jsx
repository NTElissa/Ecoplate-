import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import Navbar from '../components/site/Navbar.jsx';
import Hero from '../components/site/Hero.jsx';
import About from '../components/site/About.jsx';
import { Problem, Loop, Process } from '../components/site/Story.jsx';
import Goals from '../components/site/Goals.jsx';
import Projects from '../components/site/Projects.jsx';
import Partners from '../components/site/Partners.jsx';
import Contact from '../components/site/Contact.jsx';
import Footer from '../components/site/Footer.jsx';

const CACHE = 'ecoplate_home_v1';
const readCache = () => { try { return JSON.parse(localStorage.getItem(CACHE)); } catch { return null; } };

export default function Home() {
  const [data, setData] = useState(readCache);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    api.home()
      .then((d) => { setData(d); try { localStorage.setItem(CACHE, JSON.stringify(d)); } catch { /* storage full */ } })
      .catch((e) => setError(e.message));
  };
  useEffect(load, []);

  if (!data) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper p-6 text-center">
        <div>
          <img src="/images/logo.jpg" alt="Ecoplate" className="mx-auto h-20 w-20 rounded-full" />
          {error ? (
            <>
              <p className="mt-5 max-w-sm text-lg text-ink/80">{error}</p>
              <button onClick={load} className="btn btn-primary mt-5">Try again</button>
            </>
          ) : <p className="mt-5 text-ink/70">Loading Ecoplate…</p>}
        </div>
      </div>
    );
  }

  const { settings: s, goals } = data;
  return (
    <>
      <Navbar contact={s.contact} />
      <main>
        <Hero s={s} gallery={data.gallery} />
        <About s={s} />
        <Problem s={s} />
        <Loop s={s} />
        <Process steps={goals.filter((g) => g.kind === 'step')} />
        <Goals goals={goals} />
        <Projects projects={data.projects} />
        <Partners partners={data.partners} />
        <Contact s={s} />
      </main>
      <Footer s={s} />
    </>
  );
}
