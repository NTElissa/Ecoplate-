import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle({ className = '', inverse = false }) {
  const { dark, toggleTheme } = useTheme();
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-leaf-100 ${inverse ? 'text-leaf-100' : 'text-forest-900'} ${className}`}
      aria-label={label}
      aria-pressed={dark}
      title={label}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
