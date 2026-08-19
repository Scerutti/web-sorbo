import { axiosPrivate } from './http'
import type { TipoCosto, CreateTipoCostoRequest, UpdateTipoCostoRequest } from '@/types/tipoCosto'

/**
 * Obtiene todos los tipos de costo
 */
export const getTiposCosto = async (): Promise<TipoCosto[]> => {
  const { data } = await axiosPrivate.get<TipoCosto[]>('/tipos-costo')
  return data
}

/**
 * Obtiene un tipo de costo por ID
 */
export const getTipoCostoById = async (id: string): Promise<TipoCosto> => {
  const { data } = await axiosPrivate.get<TipoCosto>(`/tipos-costo/${id}`)
  return data
}

/**
 * Crea un nuevo tipo de costo
 */
export const createTipoCosto = async (tipo: CreateTipoCostoRequest): Promise<TipoCosto> => {
  const { data } = await axiosPrivate.post<TipoCosto>('/tipos-costo', tipo)
  return data
}

/**
 * Actualiza un tipo de costo existente
 */
export const updateTipoCosto = async (id: string, tipo: UpdateTipoCostoRequest): Promise<TipoCosto> => {
  const { data } = await axiosPrivate.patch<TipoCosto>(`/tipos-costo/${id}`, tipo)
  return data
}

/**
 * Elimina un tipo de costo. El backend responde 409 si el tipo está en uso.
 */
export const deleteTipoCosto = async (id: string): Promise<void> => {
  await axiosPrivate.delete(`/tipos-costo/${id}`)
}
