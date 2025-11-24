import { axiosPrivate } from './http'
import type { CostItem, CreateCostRequest, UpdateCostRequest } from '@/types/cost'

/**
 * Obtiene todos los costos
 */
export const getCosts = async (): Promise<CostItem[]> => {
  const { data } = await axiosPrivate.get<CostItem[]>('/costs')
  return data
}

/**
 * Obtiene un costo por ID
 */
export const getCostById = async (id: string): Promise<CostItem> => {
  const { data } = await axiosPrivate.get<CostItem>(`/costs/${id}`)
  return data
}

/**
 * Crea un nuevo costo
 */
export const createCost = async (cost: CreateCostRequest): Promise<CostItem> => {
  const { data } = await axiosPrivate.post<CostItem>('/costs', cost)
  return data
}

/**
 * Actualiza un costo existente
 */
export const updateCost = async (id: string, cost: UpdateCostRequest): Promise<CostItem> => {
  const { data } = await axiosPrivate.patch<CostItem>(`/costs/${id}`, cost)
  return data
}

/**
 * Elimina un costo
 */
export const deleteCost = async (id: string): Promise<void> => {
  await axiosPrivate.delete(`/costs/${id}`)
}

