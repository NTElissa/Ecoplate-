import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { NavLink, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, ExternalLink, Lock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { DASHBOARD_PATH } from '../lib/api.js';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { api } from '../lib/api.js';
import Overview from './Overview.jsx';
import ContentEditor from './ContentEditor.jsx';
import { Projects, Partners, Announcements, GalleryManager, Goals } from './managers.jsx';
import Donations from './Donations.jsx';
import Messages from './Messages.jsx';
import Subscribers from './Subscribers.jsx';
import Admins from './Admins.jsx';
import Account from './Account.jsx';

const DashCtx = createContext(null);
export const useDash = () => useContext(DashCtx);

const GROUPS = [
  { items: [{ to: DASHBOARD_PATH, label: 'Overview', end: true }] },
  {
    label: 'Website',
    items: [
      { to: `${DASHBOARD_PATH}/content`, label: 'Page content', perm: 'content' },
      { to: `${DASHBOARD_PATH}/goals`, label: 'Goals and steps', perm: 'goals' },
      { to: `${DASHBOARD_PATH}/projects`, label: 'Projects', perm: 'projects' },
      { to: `${DASHBOARD_PATH}/partners`, label: 'Partners', perm: 'partners' },
      { to: `${DASHBOARD_PATH}/announcements`, label: 'Announcements', perm: 'announcements' },
      { to: `${DASHBOARD_PATH}/gallery`, label: 'Gallery', perm: 'gallery' },
    ],
  },
  {
    label: 'People',
    items: [
      { to: `${DASHBOARD_PATH}/donations`, label: 'Donations', perm: 'donations', badge: 'donations' },
      { to: `${DASHBOARD_PATH}/messages`, label: 'Messages', perm: 'messages', badge: 'unreadMessages' },
      { to: `${DASHBOARD_PATH}/subscribers`, label: 'Subscribers', perm: 'subscribers' },
    ],
  },
  {
    label: 'Team',
    items: [
      { to: `${DASHBOARD_PATH}/admins`, label: 'Admins', superOnly: true },
      { to: `${DASHBOARD_PATH}/account`, label: 'My account' },
    ],
  },
];

function Guard({ perm, superOnly, children }) {
  const { can, user } = useAuth();
  const ok = superOnly ? user.role === 'superadmin' : !perm || can(perm);
  if (ok) return children;
  return (
    <div className="mx-auto mt-16 max-w-md text-center">
      <span className="mute mx-auto grid h-12 w-12 place-items-center rounded border hair"><Lock size={20} /></span>
      <h1 className="mt-4 font-display text-2xl font-bold text-forest-900">You do not have access here</h1>
      <p className="mute mt-2">Ask the super admin if you need this section.</p>
    </div>
  );
}

export default function DashboardLayout() {
  const { user, logout, can } = useAuth();
  const { dark } = useTheme();
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const loc = useLocation();

  const refresh = useCallback(() => api.get('overview').then(setStats).catch(() => {}), []);
  useEffect(() => { refresh(); const t = setInterval(refresh, 60000); return () => clearInterval(t); }, [refresh]);
  useEffect(() => setOpen(false), [loc.pathname]);

  const badges = {
    unreadMessages: stats?.counts?.unreadMessages,
    donations: (stats?.donations?.pendingCount || 0) + (stats?.donations?.needsThanks || 0),
  };
  const groups = GROUPS
    .map((g) => ({ ...g, items: g.items.filter((n) => (n.superOnly ? user.role === 'superadmin' : !n.perm || can(n.perm))) }))
    .filter((g) => g.items.length);
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  const sidebar = (
    <div className="furrows flex h-full flex-col bg-forest-900 text-leaf-100">
      <div className="flex items-center gap-3 px-5 pb-4 pt-5">
        <img src="/images/logo.jpg" alt="" className="h-10 w-10 rounded-full" />
        <div className="leading-tight"><p className="font-display text-lg font-bold text-white">Ecoplate</p><p className="text-xs text-leaf-100/60">{user.role === 'superadmin' ? 'Super admin' : 'Admin'}</p></div>
      </div>
      <nav className="flex-1 overflow-y-auto pb-4" aria-label="Dashboard">
        {groups.map((g, i) => (
          <div key={i} className="mt-3">
            {g.label && <p className="px-5 pb-1 text-[.8rem] font-semibold text-leaf-100/45">{g.label}</p>}
            {g.items.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `dash-nav ${isActive ? 'active' : ''}`}>
                <span>{n.label}</span>
                {badges[n.badge] > 0 && <span className="num rounded-sm bg-amber-400 px-1.5 text-xs font-bold text-forest-900">{badges[n.badge]}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-semibold text-white">{user.name}</p>
        <p className="truncate text-xs text-leaf-100/55">{user.email}</p>
        <div className="mt-3 flex gap-2 text-sm">
          <Link to="/" target="_blank" className="flex flex-1 items-center justify-center gap-1.5 rounded border border-white/20 py-1.5 hover:bg-white/10"><ExternalLink size={14} /> Website</Link>
          <button onClick={logout} className="flex flex-1 items-center justify-center gap-1.5 rounded border border-white/20 py-1.5 hover:bg-white/10"><LogOut size={14} /> Sign out</button>
        </div>
      </div>
    </div>
  );

  return (
    <DashCtx.Provider value={{ stats, refresh }}>
      <div className={`dashboard-shell dash min-h-screen lg:pl-60 ${dark ? 'dashboard-dark' : ''}`}>
        <aside className="fixed inset-y-0 left-0 hidden w-60 lg:block">{sidebar}</aside>

        <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-forest-900 px-3 text-white lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded hover:bg-white/10"><Menu /></button>
          <span className="font-display font-bold">Ecoplate dashboard</span>
          <ThemeToggle inverse className="hover:bg-white/10" />
        </header>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/55" onClick={() => setOpen(false)} />
            <div className="sheet-in absolute inset-y-0 left-0 w-72 max-w-[86vw]">
              <button onClick={() => setOpen(false)} className="absolute right-2 top-3 z-10 grid h-10 w-10 place-items-center text-white" aria-label="Close menu"><X /></button>
              {sidebar}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="hair hidden items-center justify-between border-b py-3 lg:flex">
            <p className="mute text-sm">{today}</p>
            <ThemeToggle className="!h-9 !w-9" />
          </div>
          <main className="dashboard-canvas pt-5 lg:pt-6">
            <Routes>
              <Route index element={<Overview />} />
              <Route path="content" element={<Guard perm="content"><ContentEditor /></Guard>} />
              <Route path="goals" element={<Guard perm="goals"><Goals /></Guard>} />
              <Route path="projects" element={<Guard perm="projects"><Projects /></Guard>} />
              <Route path="partners" element={<Guard perm="partners"><Partners /></Guard>} />
              <Route path="announcements" element={<Guard perm="announcements"><Announcements /></Guard>} />
              <Route path="gallery" element={<Guard perm="gallery"><GalleryManager /></Guard>} />
              <Route path="donations" element={<Guard perm="donations"><Donations /></Guard>} />
              <Route path="messages" element={<Guard perm="messages"><Messages /></Guard>} />
              <Route path="subscribers" element={<Guard perm="subscribers"><Subscribers /></Guard>} />
              <Route path="admins" element={<Guard superOnly><Admins /></Guard>} />
              <Route path="account" element={<Account />} />
              <Route path="*" element={<Guard perm="__none__"><span /></Guard>} />
            </Routes>
          </main>
        </div>
      </div>
    </DashCtx.Provider>
  );
}
