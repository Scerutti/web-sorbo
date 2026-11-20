import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSales, getSaleById, createSale, updateSale, deleteSale } from '@/api/sales.api'
import type { Sale, CreateSaleRequest } from '@/types/sale'

/**
 * Hook para obtener todas las ventas
 */
export const useSales = () => {
  return useQuery<Sale[]>(salesQuery)
}

/** Query de ventas. La comparten el hook y la precarga del menú. */
export const salesQuery = {
  queryKey: ['sales'],
  queryFn: getSales
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
      // Y los saldos por sector, que son el limite de la proxima venta
      queryClient.invalidateQueries({ queryKey: ['stock'] })
    }
  })
}

/**
 * Hook para actualizar una venta
 */
export const useUpdateSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, sale }: { id: string; sale: Partial<CreateSaleRequest> }) =>
      updateSale(id, sale),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['sales', data.id] })
      // Invalidar productos porque el stock puede cambiar
      queryClient.invalidateQueries({ queryKey: ['products'] })
      // Y los saldos por sector, que son el limite de la proxima venta
      queryClient.invalidateQueries({ queryKey: ['stock'] })
    }
  })
}

/**
 * Hook para eliminar una venta
 */
export const useDeleteSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      // Invalidar productos porque el stock cambia al eliminar la venta
      queryClient.invalidateQueries({ queryKey: ['products'] })
      // Y los saldos por sector, que son el limite de la proxima venta
      queryClient.invalidateQueries({ queryKey: ['stock'] })
    }
  })
}

