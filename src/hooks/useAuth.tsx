import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react'
import { User, AuthResponse } from '../shared/types'
import { authService } from '../services/auth.service'
import { getAccessToken, removeAccessToken } from '../api/http'
import { getCurrentUser } from '../api/auth.api'

interface AuthContextType {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Provider de autenticación
 * Maneja estado de usuario y token en memoria (NO localStorage para tokens)
 */
export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Sincronizar token en memoria (si fuera necesario para futuras implementaciones)
  useEffect(() => {
    if (accessToken) {
      (window as any).__accessToken = accessToken
    } else {
      delete (window as any).__accessToken
    }
  }, [accessToken])

  // Verificar sesión al montar
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Si hay token en localStorage, verificar si la sesión sigue siendo válida
        const token = getAccessToken()
        if (token) {
          try {
            // Llamar al backend para obtener el usuario actual
            const user = await getCurrentUser()
            setUser(user)
            setAccessToken(token) // Mantener el token existente
          } catch {
            // Si falla (token inválido/expirado), limpiar all
            // El interceptor de http.ts se encargará del refresh automático si es posible
            removeAccessToken()
            setUser(null)
            setAccessToken(null)
          }
        }
      } catch (error) {
        // Error inesperado, limpiar estado
        console.error('Error al verificar sesión:', error)
        removeAccessToken()
        setUser(null)
        setAccessToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response: AuthResponse = await authService.login(email, password)
      setUser(response.user)
      setAccessToken(response.accessToken)
      // authService.login ya guarda el token en localStorage (ver auth.api.ts)
    } catch (error) {
      // Re-lanzar el error para que el componente pueda manejarlo
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Continuar con logout aunque falle la llamada
      console.error('Error en logout:', error)
    } finally {
      setUser(null)
      setAccessToken(null)
      delete (window as any).__accessToken
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email)
  }, [])

  const value: AuthContextType = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
      isLoading,
      login,
      logout,
      resetPassword
    }),
    [user, accessToken, isLoading, login, logout, resetPassword]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook para acceder al contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

