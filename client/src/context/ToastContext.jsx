import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, type = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setItems((x) => [...x, { id, message, type }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 4200);
  }, []);
  const toast = { ok: (m) => push(m, 'ok'), error: (m) => push(m, 'error') };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 left-1/2 z-[100] flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col gap-2" aria-live="polite">
        {items.map((i) => (
          <div key={i.id} className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-lg ${i.type === 'ok' ? 'bg-forest-900 text-white' : 'bg-red-700 text-white'}`}>
            {i.type === 'ok' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-leaf-400" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
            <span>{i.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
