import { useEffect } from 'react';

// Old per-section hook, kept so existing imports keep working.
export function useReveal() {}

// One observer for the whole site. Anything with the "reveal" class gets "in" added the first
// time it scrolls into view, including elements that appear later (pagination, filters, route changes).
export function useGlobalReveal() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    const watch = (el) => (reduce ? el.classList.add('in') : io.observe(el));
    const scan = (root) => {
      if (root.matches?.('.reveal:not(.in)')) watch(root);
      root.querySelectorAll?.('.reveal:not(.in)').forEach(watch);
    };
    scan(document.body);
    const mo = new MutationObserver((list) => list.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && scan(n))));
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
}
