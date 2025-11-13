// src/contexts/ToastContext.tsx
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

// --- From File 1: The better API ---
interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- From File 2: The correct icons ---
const ICONS_BY_TYPE: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

// --- From File 2: The correct FlipCash brand colors ---
const COLORS_BY_TYPE: Record<ToastType, string> = {
  success: 'bg-brand-green text-white', //
  error: 'bg-brand-red text-white', //
  warning: 'bg-brand-yellow text-brand-black', //
  info: 'bg-blue-500 text-white',
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Internal function to add a toast
  const showToast = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  // Internal function to remove a toast
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- From File 1: The context value with all shortcuts ---
  const contextValue: ToastContextType = {
    showToast,
    success: (message) => showToast('success', message),
    error: (message) => showToast('error', message),
    info: (message) => showToast('info', message),
    warning: (message) => showToast('warning', message),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* --- From File 2: The better container and animation --- */}
      <div className="fixed top-4 right-4 z-50 space-y-3 w-full max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS_BY_TYPE[toast.type];
            const colors = COLORS_BY_TYPE[toast.type];
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`relative flex items-center w-full p-4 rounded-xl shadow-2xl ${colors}`}
              >
                <div className="flex-shrink-0">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-3 flex-1 font-medium">{toast.message}</div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-4 flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// --- From File 1: The hook that returns all shortcuts ---
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};