import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'
import { HTTP_TIMEOUT } from '@/shared/constants'

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
 * Request interceptor: adjunta token de acceso desde localStorage
 */
axiosPrivate.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken()
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
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

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
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

