import { axiosPrivate } from './http'
import type { Sale, CreateSaleRequest } from '@/types/sale'

/**
 * Obtiene todas las ventas
 */
export const getSales = async (): Promise<Sale[]> => {
  const { data } = await axiosPrivate.get<Sale[]>('/sales')
  return data
}

/**
 * Obtiene una venta por ID
 */
export const getSaleById = async (id: string): Promise<Sale> => {
  const { data } = await axiosPrivate.get<Sale>(`/sales/${id}`)
  return data
}

/**
 * Crea una nueva venta
 */
export const createSale = async (sale: CreateSaleRequest): Promise<Sale> => {
  const { data } = await axiosPrivate.post<Sale>('/sales', sale)
  return data
}

