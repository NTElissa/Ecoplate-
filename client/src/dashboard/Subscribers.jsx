import { Download } from 'lucide-react';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useDash } from './DashboardLayout.jsx';
import { PageHeader, Empty, Loading, DeleteButton, useList } from './ui.jsx';
import { dateTime } from '../lib/format.js';
import { usePagination } from '../lib/usePagination.js';
import Pagination from '../components/Pagination.jsx';

const PAGE_SIZE = 12;
export default function Subscribers() {
  const { items, setItems, error } = useList('subscribers');
  const { page, setPage, pageCount, pageItems } = usePagination(items || [], PAGE_SIZE);
  const { refresh } = useDash();
  const toast = useToast();
  if (error) return <p className="rounded bg-red-50 p-4 text-red-700">{error}</p>;
  if (!items) return <Loading />;

  async function remove(s) {
    try { await api.del(`subscribers/${s._id}`); setItems((x) => x.filter((y) => y._id !== s._id)); refresh(); toast.ok('Subscriber removed'); } catch (e) { toast.error(e.message); }
  }

  return (
    <>
      <PageHeader title="Subscribers" subtitle={`${items.length} people asked for news by email.`}>
        <button className="btn btn-outline !py-2.5 text-forest-800" onClick={() => api.download('subscribers/export', 'ecoplate-subscribers.csv').catch((e) => toast.error(e.message))}><Download size={18} /> Export CSV</button>
      </PageHeader>
      {items.length === 0 ? <Empty title="No subscribers yet">People who join from the website footer will be listed here.</Empty> : (
        <ul className="panel ruled overflow-hidden">
          {pageItems.map((s) => (
            <li key={s._id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0"><p className="truncate font-semibold">{s.email}</p><p className="text-xs mute">Joined {dateTime(s.createdAt)}</p></div>
              <DeleteButton onConfirm={() => remove(s)} label="" />
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} pageCount={pageCount} setPage={setPage} total={items.length} pageSize={PAGE_SIZE} />
    </>
  );
}
