import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSales, getSaleById, createSale } from '@/api/sales.api'
import type { Sale, CreateSaleRequest } from '@/types/sale'

/**
 * Hook para obtener todas las ventas
 */
export const useSales = () => {
  return useQuery<Sale[]>({
    queryKey: ['sales'],
    queryFn: getSales
  })
}

/**
 * Hook para obtener una venta por ID
 */
export const useSale = (id: string) => {
  return useQuery<Sale>({
    queryKey: ['sales', id],
    queryFn: () => getSaleById(id),
    enabled: !!id
  })
}

/**
 * Hook para crear una venta
 */
export const useCreateSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sale: CreateSaleRequest) => createSale(sale),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      // Invalidar productos porque el stock cambia
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
}

