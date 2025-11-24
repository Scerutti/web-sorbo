// import api from '../shared/httpPrivate' // TODO: Descomentar cuando backend esté listo
import { AuthResponse } from '../shared/types'
import { shouldUseMocks, mockResponse } from '../mocks/serverMock'

/**
 * Servicio de autenticación
 * Cuando VITE_USE_MOCKS=true, usa datos mockeados
 * Cuando backend esté listo, descomentar llamadas axios
 */
export const authService = {
  /**
   * Inicia sesión con email y password
   * @param email - Email del usuario
   * @param password - Contraseña
   * @returns AuthResponse con accessToken y user
   */
  async login(email: string, _password: string): Promise<AuthResponse> {
    if (shouldUseMocks()) {
      // Mock: simular login exitoso
      return mockResponse<AuthResponse>({
        accessToken: 'mock_access_token_' + Date.now(),
        user: {
          id: '1',
          email: email,
          name: 'Usuario Demo'
        }
      }, 800)
    }

    // TODO: Cuando el backend esté listo, descomentar:
    // const response = await api.post<AuthResponse>('/auth/login', { email, password: _password })
    // return response.data
    
    throw new Error('Login no implementado sin mocks')
  },

  /**
   * Cierra sesión y limpia cookies HttpOnly
   */
  async logout(): Promise<void> {
    if (shouldUseMocks()) {
      return mockResponse<void>(undefined, 300)
    }

    // TODO: Cuando el backend esté listo, descomentar:
    // await api.post('/auth/logout', {}, { withCredentials: true })
  },

  /**
   * Solicita restablecimiento de contraseña
   * @param email - Email del usuario
   */
  async resetPassword(_email: string): Promise<void> {
    if (shouldUseMocks()) {
      return mockResponse<void>(undefined, 600)
    }

    // TODO: Cuando el backend esté listo, descomentar:
    // await api.post('/auth/reset-password', { email: _email })
  },

  /**
   * Refresca el access token usando refresh token en cookie
   * @returns Nuevo accessToken
   */
  async refreshToken(): Promise<string> {
    if (shouldUseMocks()) {
      return mockResponse<string>('mock_refreshed_token_' + Date.now(), 400)
    }

    // TODO: Cuando el backend esté listo, descomentar:
    // const response = await api.post<{ accessToken: string }>(
    //   '/auth/refresh',
    //   {},
    //   { withCredentials: true }
    // )
    // return response.data.accessToken

    throw new Error('Refresh token no implementado sin mocks')
  }
}

