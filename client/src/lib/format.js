export const money = (n, cur = 'RWF') => `${new Intl.NumberFormat('en-US').format(Math.round(n || 0))} ${cur}`;
export const date = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-GB', opts) : '';
export const dateTime = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
export const cx = (...a) => a.filter(Boolean).join(' ');
