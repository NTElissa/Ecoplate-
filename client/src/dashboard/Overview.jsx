import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useDash } from './DashboardLayout.jsx';
import { DASHBOARD_PATH } from '../lib/api.js';
import { PageHeader, Loading, Status } from './ui.jsx';
import { money, dateTime } from '../lib/format.js';
import { truncateWords } from '../lib/text.js';

const TONE = { pending: 'amber', confirmed: 'green', rejected: 'red' };

function Figure({ label, value, note }) {
  return (
    <div className="px-5 py-4">
      <p className="mute text-sm font-medium">{label}</p>
      <p className="num mt-1 font-display text-[1.7rem] font-bold leading-none text-forest-900">{value}</p>
      {note && <p className="mute mt-1.5 text-sm">{note}</p>}
    </div>
  );
}

export default function Overview() {
  const { user } = useAuth();
  const { stats } = useDash();
  if (!stats) return <Loading />;

  const c = stats.counts;
  const d = stats.donations;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const todo = [];
  if (d?.pendingCount) todo.push({ n: d.pendingCount, text: d.pendingCount === 1 ? 'donation is waiting for you to confirm' : 'donations are waiting for you to confirm', to: `${DASHBOARD_PATH}/donations?status=pending`, go: 'Review' });
  if (d?.needsThanks) todo.push({ n: d.needsThanks, text: d.needsThanks === 1 ? 'confirmed gift has not been thanked yet' : 'confirmed gifts have not been thanked yet', to: `${DASHBOARD_PATH}/donations?status=confirmed&unreplied=1`, go: 'Say thanks' });
  if (c.unreadMessages) todo.push({ n: c.unreadMessages, text: c.unreadMessages === 1 ? 'message has not been read' : 'messages have not been read', to: `${DASHBOARD_PATH}/messages`, go: 'Open inbox' });

  const site = [
    ['Projects', c.projects, 'projects'], ['Partners', c.partners, 'partners'], ['Announcements', c.announcements, 'announcements'],
    ['Gallery photos', c.gallery, 'gallery'], ['Goals and steps', c.goals, 'goals'], ['Subscribers', c.subscribers, 'subscribers'], ['Team accounts', c.admins, 'admins'],
  ].filter(([, v]) => v !== undefined);

  const figures = [];
  if (d) figures.push(<Figure key="a" label="Gifts confirmed" value={money(d.confirmedTotal)} note={`${d.confirmedCount} ${d.confirmedCount === 1 ? 'donation' : 'donations'}`} />,
    <Figure key="b" label="Still to confirm" value={money(d.pendingTotal)} note={`${d.pendingCount} pending`} />);
  if (c.messages !== undefined) figures.push(<Figure key="c" label="Messages" value={c.unreadMessages} note={`unread of ${c.messages}`} />);
  if (c.subscribers !== undefined) figures.push(<Figure key="d" label="Newsletter" value={c.subscribers} note="subscribers" />);

  return (
    <>
      <PageHeader title={`${greet}, ${user.name.split(' ')[0]}`} subtitle={todo.length ? 'A few things are waiting for you.' : 'Nothing is waiting. The website is in good shape.'} />

      {(d || c.messages !== undefined) && (
        <section className="panel mb-6" aria-label="Needs your attention">
          <div className="hair border-b px-5 py-3"><h2 className="font-display text-lg font-bold text-forest-900">Needs you</h2></div>
          {todo.length === 0 ? (
            <p className="mute flex items-center gap-2 px-5 py-4"><Check size={18} className="text-forest-600" /> You are all caught up.</p>
          ) : (
            <ul className="ruled">
              {todo.map((t) => (
                <li key={t.to}>
                  <Link to={t.to} className="group flex items-center gap-4 px-5 py-3.5 hover:bg-leaf-50">
                    <span className="num grid h-9 min-w-9 place-items-center rounded bg-amber-100 px-2 font-display text-lg font-bold text-amber-800">{t.n}</span>
                    <span className="flex-1">{t.text}</span>
                    <span className="flex items-center gap-1 text-sm font-semibold text-forest-700">{t.go} <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {figures.length > 0 && (
        <section className="panel mb-6 grid grid-cols-2 lg:grid-cols-4 [&>*]:border-[var(--d-line)] [&>*:nth-child(n+3)]:border-t [&>*:nth-child(even)]:border-l lg:[&>*:nth-child(n+2)]:border-l lg:[&>*:nth-child(n+3)]:border-t-0 lg:[&>*:nth-child(3)]:border-l">
          {figures}
        </section>
      )}

      {stats.donationSeries && (
        <section className="panel mb-6 p-5">
          <h2 className="font-display text-lg font-bold text-forest-900">Confirmed donations, last six months</h2>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.donationSeries} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#c9d1b8" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
                <Tooltip formatter={(v) => money(v)} cursor={{ fill: 'rgb(141 198 63 / .14)' }} />
                <Bar dataKey="total" name="Donations" fill="#2e6a3d" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {stats.recentDonations && (
          <section className="panel">
            <div className="hair flex items-center justify-between border-b px-5 py-3"><h2 className="font-display text-lg font-bold text-forest-900">Latest donations</h2><Link to={`${DASHBOARD_PATH}/donations`} className="text-sm font-semibold text-forest-700 underline underline-offset-2">All donations</Link></div>
            {stats.recentDonations.length === 0 ? <p className="mute px-5 py-4">No donations yet.</p> : (
              <ul className="ruled">
                {stats.recentDonations.map((x) => (
                  <li key={x._id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{x.donorName}</p>
                      <p className="mute num text-xs">{x.reference} on {dateTime(x.createdAt)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="num font-bold">{money(x.amount, x.currency)}</p>
                      <div className="flex items-center justify-end gap-3"><Status tone={TONE[x.status]}>{x.status}</Status><Link to={`${DASHBOARD_PATH}/donations?reply=${x._id}`} className="text-sm font-semibold text-forest-700 underline underline-offset-2">Reply</Link></div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        {stats.recentMessages && (
          <section className="panel">
            <div className="hair flex items-center justify-between border-b px-5 py-3"><h2 className="font-display text-lg font-bold text-forest-900">Latest messages</h2><Link to={`${DASHBOARD_PATH}/messages`} className="text-sm font-semibold text-forest-700 underline underline-offset-2">Open inbox</Link></div>
            {stats.recentMessages.length === 0 ? <p className="mute px-5 py-4">No messages yet.</p> : (
              <ul className="ruled">
                {stats.recentMessages.map((m) => (
                  <li key={m._id} className="px-5 py-3">
                    <p className="flex items-center gap-2 font-semibold">{m.name} {!m.read && <span className="h-2 w-2 rounded-full bg-amber-500" aria-label="unread" />}</p>
                    <p className="mute line-clamp-1 text-sm">{truncateWords(m.body, 18)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      {site.length > 0 && (
        <section className="panel mt-6">
          <div className="hair border-b px-5 py-3"><h2 className="font-display text-lg font-bold text-forest-900">On the website now</h2></div>
          <dl className="grid sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3 [&>*]:mx-0">
            {site.map(([label, v, to]) => (
              <Link key={label} to={`${DASHBOARD_PATH}/${to}`} className="hair flex items-baseline justify-between gap-3 border-b px-5 py-3 last:border-b-0 hover:bg-leaf-50">
                <dt>{label}</dt><dd className="num font-display text-xl font-bold text-forest-900">{v}</dd>
              </Link>
            ))}
          </dl>
        </section>
      )}
    </>
  );
}
