import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper p-6 text-center">
      <ThemeToggle className="fixed right-4 top-4 z-50" />
      <div className="max-w-md">
        <img src="/images/logo.jpg" alt="Ecoplate" className="mx-auto h-20 w-20 rounded-full" />
        <h1 className="mt-6 text-4xl font-extrabold text-forest-900">This page has gone back to the soil.</h1>
        <p className="mt-3 text-lg text-ink/70">We could not find what you were looking for. The home page has everything else.</p>
        <Link to="/" className="btn btn-primary mt-6">Go to the home page</Link>
      </div>
    </div>
  );
}
