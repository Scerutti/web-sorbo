import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCosts, getCostById, createCost, updateCost, deleteCost } from '@/api/costs.api'
import type { CostItem, CreateCostRequest, UpdateCostRequest } from '@/types/cost'

/**
 * Hook para obtener todos los costos
 */
export const useCosts = () => {
  return useQuery<CostItem[]>({
    queryKey: ['costs'],
    queryFn: getCosts
  })
}

/**
 * Hook para obtener un costo por ID
 */
export const useCost = (id: string) => {
  return useQuery<CostItem>({
    queryKey: ['costs', id],
    queryFn: () => getCostById(id),
    enabled: !!id
  })
}

/**
 * Hook para crear un costo
 */
export const useCreateCost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cost: CreateCostRequest) => createCost(cost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costs'] })
      // Invalidar productos también porque dependen de costos
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
}

/**
 * Hook para actualizar un costo
 */
export const useUpdateCost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, cost }: { id: string; cost: UpdateCostRequest }) => updateCost(id, cost),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['costs'] })
      queryClient.invalidateQueries({ queryKey: ['costs', data.id] })
      // Invalidar productos también porque dependen de costos
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
}

/**
 * Hook para eliminar un costo
 */
export const useDeleteCost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costs'] })
      // Invalidar productos también porque dependen de costos
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
}

