import { useState } from 'react';

type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastState extends ToastProps {
  id: string;
  visible: boolean;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const toast = ({ 
    title, 
    description, 
    variant = 'default', 
    duration = 5000 
  }: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    const newToast: ToastState = {
      id,
      title,
      description,
      variant,
      duration,
      visible: true,
    };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => 
        prev.map(t => t.id === id ? { ...t, visible: false } : t)
      );
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300); // Animation duration
    }, duration);
    
    return id;
  };
  
  const dismiss = (id: string) => {
    setToasts(prev => 
      prev.map(t => t.id === id ? { ...t, visible: false } : t)
    );
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  };

  return {
    toast,
    dismiss,
    toasts,
  };
}