import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSaldos,
  getResumen,
  getMovimientos,
  createMovimiento
} from '@/api/stock.api'
import type {
  StockSector,
  StockResumen,
  MovimientoStock,
  CreateMovimientoRequest,
  StockQuery,
  MovimientosQuery
} from '@/types/stock'

/**
 * Un movimiento cambia saldos, consolidado, libro y el `stock` que devuelve
 * el backend en cada producto, que es la suma de los sectores.
 */
const invalidateStockDependents = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['stock'] })
  queryClient.invalidateQueries({ queryKey: ['products'] })
}

export const useSaldos = (query: StockQuery = {}) => {
  return useQuery<StockSector[]>({
    queryKey: ['stock', 'saldos', query],
    queryFn: () => getSaldos(query)
  })
}

export const useStockResumen = (productId?: string) => {
  return useQuery<StockResumen[]>({
    queryKey: ['stock', 'resumen', productId ?? null],
    queryFn: () => getResumen(productId)
  })
}

export const useMovimientos = (query: MovimientosQuery = {}) => {
  return useQuery<MovimientoStock[]>({
    queryKey: ['stock', 'movimientos', query],
    queryFn: () => getMovimientos(query)
  })
}

export const useCreateMovimiento = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (movimiento: CreateMovimientoRequest) => createMovimiento(movimiento),
    onSuccess: () => invalidateStockDependents(queryClient)
  })
}
