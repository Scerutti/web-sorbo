import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react'
import { useCurrentUser, useLogin, useLogout, useResetPassword } from '@/hooks/useAuth'
import { getAccessToken } from '@/api/http'
import type { User } from '@/types/auth'

interface AuthContextType {
  user: User | undefined
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Provider de autenticación usando React Query
 */
export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const accessToken = getAccessToken()
  const { data: user, isLoading, isError } = useCurrentUser()
  const loginMutation = useLogin()
  const logoutMutation = useLogout()
  const resetPasswordMutation = useResetPassword()

  const isAuthenticated = useMemo(() => {
    return !!user && !!accessToken && !isError
  }, [user, accessToken, isError])

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      await loginMutation.mutateAsync({ email, password })
    },
    [loginMutation]
  )

  const logout = useCallback(async (): Promise<void> => {
    await logoutMutation.mutateAsync()
  }, [logoutMutation])

  const resetPassword = useCallback(
    async (email: string): Promise<void> => {
      await resetPasswordMutation.mutateAsync({ email })
    },
    [resetPasswordMutation]
  )

  // Si no hay token, no está cargando (ya sabemos que no está autenticado)
  const isLoadingState = accessToken ? isLoading : false

  const value: AuthContextType = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated,
      isLoading: isLoadingState,
      login,
      logout,
      resetPassword
    }),
    [user, accessToken, isAuthenticated, isLoadingState, login, logout, resetPassword]
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

