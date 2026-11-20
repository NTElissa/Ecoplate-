import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import Navbar from '../components/site/Navbar.jsx';
import Gallery from '../components/site/Gallery.jsx';
import News from '../components/site/News.jsx';
import Donate from '../components/site/Donate.jsx';
import Proof from '../components/site/Proof.jsx';
import { Process } from '../components/site/Story.jsx';
import Footer from '../components/site/Footer.jsx';
import NotFound from './NotFound.jsx';

const CACHE = 'ecoplate_home_v1';
const readCache = () => {
  try { return JSON.parse(localStorage.getItem(CACHE)); } catch { return null; }
};

export default function PublicContentPage({ page }) {
  const [data, setData] = useState(readCache);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    api.home()
      .then((result) => {
        setData(result);
        try { localStorage.setItem(CACHE, JSON.stringify(result)); } catch { /* storage full */ }
      })
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

  let content;
  if (page === 'gallery') content = <Gallery items={data.gallery} />;
  else if (page === 'how-it-works') {
    content = (
      <>
        <Process steps={data.goals.filter((goal) => goal.kind === 'step')} />
        <Proof />
      </>
    );
  }
  else if (page === 'news') content = <News items={data.announcements} />;
  else if (page === 'donate') content = <Donate s={data.settings} stats={data.donations} />;
  else content = <NotFound />;

  return (
    <>
      <Navbar contact={data.settings.contact} />
      <main id="top">{content}</main>
      <Footer s={data.settings} />
    </>
  );
}
