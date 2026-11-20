import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import PublicContentPage from './pages/PublicContent.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/Login.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { LOGIN_PATH } from './lib/api.js';
import ScrollManager from './components/ScrollManager.jsx';
import { useGlobalReveal } from './lib/useReveal.js';

const Dashboard = lazy(() => import('./dashboard/DashboardLayout.jsx'));

const Spinner = () => (
  <div className="grid min-h-screen place-items-center bg-paper"><div className="h-10 w-10 animate-spin rounded-full border-4 border-leaf-200 border-t-forest-800" /></div>
);

// Signed-out visitors who guess /dashboard just see the normal "page not found" screen.
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <NotFound />;
}

export default function App() {
  const { user } = useAuth();
  useGlobalReveal();
  return (
    <>
    <ScrollManager />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/gallery" element={<PublicContentPage page="gallery" />} />
      <Route path="/how-it-works" element={<PublicContentPage page="how-it-works" />} />
      <Route path="/results" element={<Navigate to="/how-it-works#results" replace />} />
      <Route path="/news" element={<PublicContentPage page="news" />} />
      <Route path="/donate" element={<PublicContentPage page="donate" />} />
      {LOGIN_PATH && <Route path={`/${LOGIN_PATH}`} element={user ? <Navigate to="/dashboard" replace /> : <Login />} />}
      <Route path="/dashboard/*" element={<Protected><Suspense fallback={<Spinner />}><Dashboard /></Suspense></Protected>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
}
