import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSectores,
  getSectorById,
  createSector,
  updateSector,
  deleteSector
} from '@/api/sectores.api'
import type { Sector, CreateSectorRequest, UpdateSectorRequest } from '@/types/sector'

/**
 * Tocar un sector cambia dónde puede haber stock y qué ve cada usuario, así
 * que arrastra a los saldos y al consolidado.
 */
const invalidateSectorDependents = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['sectores'] })
  queryClient.invalidateQueries({ queryKey: ['stock'] })
  queryClient.invalidateQueries({ queryKey: ['users'] })
}

export const useSectores = () => {
  return useQuery<Sector[]>({
    queryKey: ['sectores'],
    queryFn: getSectores
  })
}

export const useSector = (id: string) => {
  return useQuery<Sector>({
    queryKey: ['sectores', id],
    queryFn: () => getSectorById(id),
    enabled: !!id
  })
}

export const useCreateSector = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sector: CreateSectorRequest) => createSector(sector),
    onSuccess: () => invalidateSectorDependents(queryClient)
  })
}

export const useUpdateSector = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, sector }: { id: string; sector: UpdateSectorRequest }) =>
      updateSector(id, sector),
    onSuccess: (data) => {
      invalidateSectorDependents(queryClient)
      queryClient.invalidateQueries({ queryKey: ['sectores', data.id] })
    }
  })
}

export const useDeleteSector = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSector(id),
    onSuccess: () => invalidateSectorDependents(queryClient)
  })
}
