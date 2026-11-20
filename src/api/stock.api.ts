import { axiosPrivate } from './http'
import type {
  StockSector,
  StockResumen,
  MovimientoStock,
  CreateMovimientoRequest,
  StockQuery,
  MovimientosQuery
} from '@/types/stock'

/**
 * Saldos por producto y sector.
 *
 * El backend ya acota el resultado: un vendedor sólo ve su sector, aunque
 * pida otro. Un admin ve todos, o el que indique en `sectorId`.
 */
export const getSaldos = async (query: StockQuery = {}): Promise<StockSector[]> => {
  const { data } = await axiosPrivate.get<StockSector[]>('/stock', { params: query })
  return data
}

/**
 * Stock general del emprendimiento: por cada producto, el total y el desglose
 * por sector. Incluye los sectores en cero, para que se vean los faltantes.
 */
export const getResumen = async (productId?: string): Promise<StockResumen[]> => {
  const { data } = await axiosPrivate.get<StockResumen[]>('/stock/resumen', {
    params: productId ? { productId } : {}
  })
  return data
}

/**
 * Libro de movimientos, del más reciente al más viejo.
 */
export const getMovimientos = async (
  query: MovimientosQuery = {}
): Promise<MovimientoStock[]> => {
  const { data } = await axiosPrivate.get<MovimientoStock[]>('/stock/movimientos', {
    params: query
  })
  return data
}

/**
 * Registra un movimiento. Requiere rol admin.
 * El backend responde 409 si no hay stock suficiente o el sector está inactivo.
 */
export const createMovimiento = async (
  movimiento: CreateMovimientoRequest
): Promise<MovimientoStock> => {
  const { data } = await axiosPrivate.post<MovimientoStock>(
    '/stock/movimientos',
    movimiento
  )
  return data
}
