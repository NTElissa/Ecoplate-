export function truncateWords(value, limit) {
  const words = String(value || '').trim().split(/\s+/).filter(Boolean);
  return words.length > limit ? `${words.slice(0, limit).join(' ')}…` : words.join(' ');
}
