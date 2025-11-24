import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'
import { HTTP_TIMEOUT } from './constants'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * Instancia de Axios configurada para peticiones autenticadas
 * - withCredentials: true permite enviar cookies HttpOnly (refresh token)
 * - Interceptors manejan Authorization header y refresh flow
 */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: HTTP_TIMEOUT,
  withCredentials: true // Necesario para cookies HttpOnly
})

/**
 * Request interceptor: adjunta token de acceso desde memoria (contexto de auth)
 * NO se guarda en localStorage/sessionStorage por seguridad
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // TODO: Obtener accessToken desde el contexto de auth (in-memory)
    // Ejemplo:
    // const { accessToken } = useAuth() // Esto no funciona aquí, necesita inyección
    // if (accessToken) {
    //   config.headers.Authorization = `Bearer ${accessToken}`
    // }
    
    // Por ahora, obtener desde una variable global o contexto externo
    // Esto se implementará en el hook useAuth que proveerá el token
    const accessToken = (window as any).__accessToken || null
    if (accessToken) {
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
 * - Si refresh exitoso, reintenta la petición original
 * - Si refresh falla, redirige a login
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.config) {
      return Promise.reject(error instanceof Error ? error : new Error(String(error)))
    }
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // TODO: Llamar endpoint de refresh con withCredentials
        // El backend debe devolver nuevo accessToken en body o header
        // const refreshRes = await axios.post(
        //   `${BASE_URL}/auth/refresh`,
        //   {},
        //   { withCredentials: true }
        // )
        // const newAccessToken = refreshRes.data.accessToken
        // 
        // Actualizar accessToken en memoria (contexto de auth)
        // (window as any).__accessToken = newAccessToken
        //
        // Reintentar petición original con nuevo token
        // if (originalRequest.headers) {
        //   originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        // }
        // return api(originalRequest)

        // TODO: Implementar refresh token cuando backend esté listo
        // Por ahora, simular fallo y redirigir
        const refreshError = new Error('Session expired')
        throw refreshError
      } catch (refreshError) {
        // Limpiar token de memoria
        delete (window as any).__accessToken

        // Redirigir a login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError instanceof Error ? refreshError : new Error(String(refreshError)))
      }
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  }
)

export default api

