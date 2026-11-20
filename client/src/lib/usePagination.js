import { useEffect, useState } from 'react';

export function usePagination(items, pageSize) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, pageCount);

  useEffect(() => {
    if (page !== currentPage) setPage(currentPage);
  }, [page, currentPage]);

  return {
    page: currentPage,
    setPage,
    pageCount,
    pageItems: items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
  };
}
