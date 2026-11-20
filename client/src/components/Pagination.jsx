import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pageCount, setPage, total, pageSize }) {
  if (pageCount <= 1) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-between gap-3" aria-label="Pagination">
      <p className="text-sm text-ink/65" aria-live="polite">Showing {first}–{last} of {total}</p>
      <div className="flex items-center gap-2">
        <button type="button" className="btn btn-outline !px-3 !py-2 text-sm text-forest-800" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Previous page">
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="text-sm font-semibold text-forest-800" aria-current="page">Page {page} of {pageCount}</span>
        <button type="button" className="btn btn-outline !px-3 !py-2 text-sm text-forest-800" disabled={page === pageCount} onClick={() => setPage(page + 1)} aria-label="Next page">
          Next <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
