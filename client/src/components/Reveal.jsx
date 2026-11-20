import { useEffect, useRef, useState } from 'react';

// Wrapper that fades its children in as they scroll into view.
// variant: up (default) | left | right | zoom.  delay in milliseconds, for staggering.
export function Reveal({ as: Tag = 'div', variant = 'up', delay = 0, className = '', style, children, ...rest }) {
  const v = variant === 'up' ? '' : ` reveal-${variant}`;
  return <Tag className={`reveal${v} ${className}`} style={{ '--d': `${delay}ms`, ...style }} {...rest}>{children}</Tag>;
}

// Splits a headline into words that slide up one after another on load.
export function Words({ text, start = 0, step = 70 }) {
  return String(text || '').split(' ').map((w, i) => (
    <span key={i}><span className="word"><span style={{ '--d': `${start + i * step}ms` }}>{w}</span></span>{' '}</span>
  ));
}

// Counts the numbers inside a string up from zero when it scrolls into view: "64.5 to 70%".
export function CountText({ text, duration = 1400 }) {
  const ref = useRef(null);
  const [p, setP] = useState(() => (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 1 : 0));

  useEffect(() => {
    if (p === 1 || !ref.current) return;
    let raf;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / duration);
        setP(1 - Math.pow(1 - k, 3));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [duration]); // eslint-disable-line react-hooks/exhaustive-deps

  const out = String(text).replace(/\d+(\.\d+)?/g, (m) => {
    const dec = (m.split('.')[1] || '').length;
    return (parseFloat(m) * p).toFixed(dec);
  });
  return <span ref={ref} aria-label={text}>{out}</span>;
}
