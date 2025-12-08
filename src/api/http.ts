import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'
import { HTTP_TIMEOUT } from '@/shared/constants'
import { toastManager } from '@/shared/toastManager'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

/**
 * Token storage key
 */
const ACCESS_TOKEN_KEY = 'accessToken'

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * Set access token in localStorage
 */
export const setAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

/**
 * Remove access token from localStorage
 */
export const removeAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

/**
 * Instancia de Axios configurada para peticiones autenticadas
 * - withCredentials: true permite enviar cookies HttpOnly (refresh token)
 * - Interceptors manejan Authorization header y refresh flow
 */
export const axiosPrivate: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: HTTP_TIMEOUT,
  withCredentials: true // Necesario para cookies HttpOnly
})

/**
 * Instancia de Axios para peticiones públicas (sin auth)
 */
export const axiosPublic: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: HTTP_TIMEOUT,
  withCredentials: true
})

/**
 * Cache para evitar mostrar toasts duplicados de timeout
 * Key: URL del request, Value: timestamp del último toast mostrado
 */
const timeoutToastCache = new Map<string, number>()
const TOAST_COOLDOWN_MS = 5000 // No mostrar el mismo toast más de una vez cada 5 segundos

/**
 * Helper para marcar tiempo de inicio en config
 */
const markRequestStartTime = (config: InternalAxiosRequestConfig) => {
  // Marcar tiempo de inicio para detectar requests lentos (>1000ms)
  // Render puede tardar en "despertar", informamos al usuario
  ;(config as any).__requestStartTime = Date.now()
  return config
}

/**
 * Helper para mostrar toast de timeout solo una vez por URL en un período corto
 */
const showTimeoutToast = (url: string | undefined) => {
  if (!url) return
  
  const now = Date.now()
  const lastShown = timeoutToastCache.get(url)
  
  // Si ya se mostró recientemente (dentro del cooldown), no mostrar de nuevo
  if (lastShown && now - lastShown < TOAST_COOLDOWN_MS) {
    return
  }
  
  // Marcar que se mostró ahora
  timeoutToastCache.set(url, now)
  
  // Mostrar el toast
  toastManager.warning(
    'El servidor está tardando en responder. Por favor, intenta nuevamente.',
    6000
  )
  
  // Limpiar cache después de un tiempo para evitar memoria infinita
  setTimeout(() => {
    timeoutToastCache.delete(url)
  }, TOAST_COOLDOWN_MS * 2)
}

/**
 * Request interceptor para axiosPrivate: adjunta token y marca tiempo
 */
axiosPrivate.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken()
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return markRequestStartTime(config)
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  }
)

/**
 * Request interceptor para axiosPublic: marca tiempo de inicio
 */
axiosPublic.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return markRequestStartTime(config)
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  }
)

/**
 * Response interceptor: maneja refresh flow automático en caso de 401
 * - Si recibe 401, intenta refresh usando cookie HttpOnly
 * - Si refresh exitoso, actualiza token y reintenta la petición original
 * - Si refresh falla, limpia token y redirige a login
 */
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (error?: unknown) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

/**
 * Response interceptor para axiosPrivate
 */
axiosPrivate.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { 
      _retry?: boolean
    }
    
    // Si es un error de timeout, mostrar toast (con protección contra duplicados)
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      const url = originalRequest?.url || error.config?.url
      showTimeoutToast(url)
    }
    // Excluir endpoints de autenticación del refresh automático para evitar loops
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || 
                          originalRequest?.url?.includes('/auth/refresh')

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Si ya está refrescando, encolar la petición
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return axiosPrivate(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Llamar endpoint de refresh con withCredentials
        const refreshRes = await axiosPublic.post<{ accessToken: string }>(
          '/auth/refresh',
          {},
          { withCredentials: true }
        )
        const newAccessToken = refreshRes.data.accessToken

        // Actualizar token en localStorage
        setAccessToken(newAccessToken)

        // Procesar cola de peticiones fallidas
        processQueue(null, newAccessToken)

        // Reintentar petición original con nuevo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }
        return axiosPrivate(originalRequest)
      } catch (refreshError) {
        // Limpiar token
        removeAccessToken()
        processQueue(refreshError instanceof Error ? refreshError : new Error(String(refreshError)), null)

        // Redirigir a login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }

        return Promise.reject(
          refreshError instanceof Error ? refreshError : new Error(String(refreshError))
        )
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  }
)

/**
 * Response interceptor para axiosPublic (incluye login)
 */
axiosPublic.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config
    
    // Si es un error de timeout, mostrar toast (con protección contra duplicados)
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      const url = originalRequest?.url || error.config?.url
      showTimeoutToast(url)
    }
    
    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  }
)

/**
 * Logout: limpia token y llama al endpoint de logout
 */
export const logout = async (): Promise<void> => {
  try {
    await axiosPrivate.post('/auth/logout', {}, { withCredentials: true })
  } catch (error) {
    console.error('Error en logout:', error)
  } finally {
    removeAccessToken()
  }
}

