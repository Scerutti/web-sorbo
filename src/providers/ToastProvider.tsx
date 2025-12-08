import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react'
import { ToastContainer, type Toast, type ToastType } from '../components/ui/Toast'
import { initToastManager } from '../shared/toastManager'

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

/**
 * Provider de toasts
 * Maneja el estado de todas las notificaciones toast
 */
export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 5000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const newToast: Toast = {
      id,
      message,
      type,
      duration
    }
    setToasts(prev => [...prev, newToast])
  }, [])

  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration)
  }, [showToast])

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration)
  }, [showToast])

  const warning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration)
  }, [showToast])

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration)
  }, [showToast])

  // Inicializar toastManager para que los interceptors de Axios puedan usar toasts
  useEffect(() => {
    initToastManager(showToast)
  }, [showToast])

  const value: ToastContextType = useMemo(
    () => ({
      showToast,
      success,
      error,
      warning,
      info
    }),
    [showToast, success, error, warning, info]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

/**
 * Hook para usar toasts
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast debe usarse dentro de ToastProvider')
  }
  return context
}

