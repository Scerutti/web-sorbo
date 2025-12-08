/**
 * Toast Manager - Singleton para permitir que los interceptors de Axios
 * muestren toasts sin necesidad de acceso al contexto de React
 */

type ToastType = 'info' | 'success' | 'error' | 'warning'

type ToastFunction = (message: string, type?: ToastType, duration?: number) => void

let toastFunction: ToastFunction | null = null

/**
 * Inicializa el toast manager con la función de toast del contexto
 * Debe llamarse desde ToastProvider al montar
 */
export const initToastManager = (toastFn: ToastFunction): void => {
  toastFunction = toastFn
}

/**
 * Muestra un toast usando el sistema de toasts de la app
 * Puede ser llamado desde cualquier parte, incluso desde interceptors de Axios
 */
export const showToast = (message: string, type: ToastType = 'info', duration?: number): void => {
  if (toastFunction) {
    toastFunction(message, type, duration)
    return
  }
  // Fallback: solo en desarrollo, para no romper si no está inicializado
  if (import.meta.env.DEV) {
    console.warn('ToastManager no inicializado. Mensaje:', message)
  }
}

/**
 * Helpers específicos para tipos de toast
 */
export const toastManager = {
  info: (message: string, duration?: number) => showToast(message, 'info', duration),
  success: (message: string, duration?: number) => showToast(message, 'success', duration),
  error: (message: string, duration?: number) => showToast(message, 'error', duration),
  warning: (message: string, duration?: number) => showToast(message, 'warning', duration)
}

