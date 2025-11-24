import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthResponse } from '../shared/types'
import { authService } from '../services/auth.service'

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
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Sincronizar token con httpPrivate
  useEffect(() => {
    if (accessToken) {
      (window as any).__accessToken = accessToken
    } else {
      delete (window as any).__accessToken
    }
  }, [accessToken])

  // Verificar sesión al montar
  useEffect(() => {
    // TODO: Verificar si hay sesión activa llamando al backend
    // Por ahora, inicializar como no autenticado
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await authService.login(email, password)
      setUser(response.user)
      setAccessToken(response.accessToken)
      // Token se guarda solo en memoria, no en localStorage
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
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
  }

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email)
  }

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    logout,
    resetPassword
  }

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

