import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { login, getCurrentUser, resetPassword } from '@/api/auth.api'
import { logout as logoutApi, removeAccessToken, getAccessToken } from '@/api/http'
import type { LoginRequest, ResetPasswordRequest, User } from '@/types/auth'

/**
 * Hook para obtener el usuario actual
 */
export const useCurrentUser = () => {
  const token = getAccessToken()
  
  return useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: Infinity,
    enabled: !!token // Solo ejecutar si hay token
  })
}

/**
 * Hook para login
 */
export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: (data) => {
      // Actualizar cache con el usuario
      queryClient.setQueryData(['auth', 'me'], data.user)
    }
  })
}

/**
 * Hook para logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      // Limpiar cache
      queryClient.clear()
      removeAccessToken()
    }
  })
}

/**
 * Hook para reset password
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (request: ResetPasswordRequest) => resetPassword(request)
  })
}

