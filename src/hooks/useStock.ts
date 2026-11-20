import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSaldos,
  getResumen,
  getMovimientos,
  createMovimiento,
  fijarSaldos
} from '@/api/stock.api'
import type {
  StockSector,
  StockResumen,
  MovimientoStock,
  CreateMovimientoRequest,
  FijarSaldosRequest,
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

/** Queries de stock. Las comparten los hooks y la precarga del menú. */
export const stockResumenQuery = (productId?: string) => ({
  queryKey: ['stock', 'resumen', productId ?? null],
  queryFn: () => getResumen(productId)
})

export const movimientosQuery = (query: MovimientosQuery = {}) => ({
  queryKey: ['stock', 'movimientos', query],
  queryFn: () => getMovimientos(query)
})

export const useStockResumen = (productId?: string) => {
  return useQuery<StockResumen[]>(stockResumenQuery(productId))
}

export const useMovimientos = (query: MovimientosQuery = {}) => {
  return useQuery<MovimientoStock[]>(movimientosQuery(query))
}

export const useCreateMovimiento = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (movimiento: CreateMovimientoRequest) => createMovimiento(movimiento),
    onSuccess: () => invalidateStockDependents(queryClient)
  })
}

/**
 * Fija el reparto de un producto entre sectores en un solo request. La
 * invalidación es una sola, al final, en vez de una por sector movido.
 */
export const useFijarSaldos = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: FijarSaldosRequest) => fijarSaldos(request),
    // Sin reintento: el default del queryClient (retry: 1) repetía un 409 o
    // un 400 que va a fallar igual, y el aviso llegaba un segundo tarde.
    retry: false,
    // También ante un error: un 409 significa que los saldos en caché están
    // viejos, y la próxima vez que se abra el producto tienen que ser los reales.
    onSettled: () => invalidateStockDependents(queryClient)
  })
}
