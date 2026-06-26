import { createContext, useState, useContext, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback({
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-up flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${
              t.type === 'success' ? 'bg-emerald-900/80 border-emerald-500/30 text-emerald-200' :
              t.type === 'error' ? 'bg-red-900/80 border-red-500/30 text-red-200' :
              t.type === 'warning' ? 'bg-amber-900/80 border-amber-500/30 text-amber-200' :
              'bg-indigo-900/80 border-indigo-500/30 text-indigo-200'
            }`}
          >
            <span className="mt-0.5 shrink-0">
              {t.type === 'success' ? <CheckCircle2 size={18} aria-hidden="true" /> :
               t.type === 'error' ? <AlertCircle size={18} aria-hidden="true" /> :
               t.type === 'warning' ? <AlertTriangle size={18} aria-hidden="true" /> :
               <Info size={18} aria-hidden="true" />}
            </span>
            <span className="text-sm font-medium flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="p-0.5 rounded hover:bg-black/20 transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
