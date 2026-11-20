import { createContext, useContext, useLayoutEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'ecoplate_theme';

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'dark'; } catch { return false; }
  });

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('theme-dark', dark);
    try { localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light'); } catch { /* storage unavailable */ }
  }, [dark]);

  const toggleTheme = () => setDark((value) => !value);
  return <ThemeContext.Provider value={{ dark, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used within ThemeProvider');
  return theme;
}
