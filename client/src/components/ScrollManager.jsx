import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Makes links like /#about and /how-it-works#results land on the right section, even when the
// page has to load its content first, and starts every other page at the top.
export default function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    const timer = setInterval(() => {
      const el = document.getElementById(id);
      if (el) {
        clearInterval(timer);
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (++tries > 60) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, [pathname, hash, key]);

  return null;
}
