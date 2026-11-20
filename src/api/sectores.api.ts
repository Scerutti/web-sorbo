import { axiosPrivate } from './http'
import type { Sector, CreateSectorRequest, UpdateSectorRequest } from '@/types/sector'

/**
 * Obtiene todos los sectores
 */
export const getSectores = async (): Promise<Sector[]> => {
  const { data } = await axiosPrivate.get<Sector[]>('/sectores')
  return data
}

/**
 * Obtiene un sector por ID
 */
export const getSectorById = async (id: string): Promise<Sector> => {
  const { data } = await axiosPrivate.get<Sector>(`/sectores/${id}`)
  return data
}

/**
 * Crea un nuevo sector. Requiere rol admin.
 */
export const createSector = async (sector: CreateSectorRequest): Promise<Sector> => {
  const { data } = await axiosPrivate.post<Sector>('/sectores', sector)
  return data
}

/**
 * Actualiza un sector existente. Requiere rol admin.
 */
export const updateSector = async (id: string, sector: UpdateSectorRequest): Promise<Sector> => {
  const { data } = await axiosPrivate.patch<Sector>(`/sectores/${id}`, sector)
  return data
}

/**
 * Elimina un sector. El backend responde 409 si todavía tiene stock.
 */
export const deleteSector = async (id: string): Promise<void> => {
  await axiosPrivate.delete(`/sectores/${id}`)
}
