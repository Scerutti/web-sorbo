import { axiosPublic, axiosPrivate, setAccessToken } from './http'
import type { AuthResponse, LoginRequest, RefreshTokenResponse, ResetPasswordRequest } from '@/types/auth'

/**
 * Login con email y password
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const { data } = await axiosPublic.post<AuthResponse>('/auth/login', credentials, {
    withCredentials: true
  })
  // Guardar token en localStorage
  setAccessToken(data.accessToken)
  return data
}

/**
 * Logout: limpia token y llama al endpoint
 * Usa la función logout de http.ts que ya maneja esto
 */

/**
 * Refresh token usando cookie HttpOnly
 */
export const refreshToken = async (): Promise<string> => {
  const { data } = await axiosPublic.post<RefreshTokenResponse>(
    '/auth/refresh',
    {},
    { withCredentials: true }
  )
  setAccessToken(data.accessToken)
  return data.accessToken
}

/**
 * Solicita restablecimiento de contraseña
 */
export const resetPassword = async (request: ResetPasswordRequest): Promise<void> => {
  await axiosPublic.post('/auth/reset-password', request)
}

/**
 * Obtiene el usuario actual autenticado
 * El backend retorna { user: {...} }, así que extraemos la propiedad user
 */
export const getCurrentUser = async (): Promise<AuthResponse['user']> => {
  const { data } = await axiosPrivate.get<AuthResponse>('/auth/me')
  return data.user
}

