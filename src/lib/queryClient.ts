import { QueryClient } from '@tanstack/react-query'

/**
 * Query Client configurado para React Query
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000 // 5 minutos
    },
    mutations: {
      retry: 1
    }
  }
})

