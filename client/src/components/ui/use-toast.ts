import { useState, useCallback } from 'react';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  variant?: 'default' | 'destructive';
}

interface Toast extends ToastOptions {
  id: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id = Date.now();
    const newToast = { ...options, id };
    
    setToasts((current) => [...current, newToast]);

    if (options.duration !== Infinity) {
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, options.duration || 5000);
    }

    return {
      id,
      dismiss: () => setToasts((current) => current.filter((t) => t.id !== id)),
    };
  }, []);

  return { toast, toasts };
}