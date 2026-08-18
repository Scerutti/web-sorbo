import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTiposCosto,
  getTipoCostoById,
  createTipoCosto,
  updateTipoCosto,
  deleteTipoCosto
} from '@/api/tiposCosto.api'
import type { TipoCosto, CreateTipoCostoRequest, UpdateTipoCostoRequest } from '@/types/tipoCosto'

/**
 * Un cambio en los tipos de costo altera qué costos aplican a cada producto,
 * y por lo tanto los precios que devuelve el backend.
 */
const invalidateTipoCostoDependents = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['tipos-costo'] })
  queryClient.invalidateQueries({ queryKey: ['costs'] })
  queryClient.invalidateQueries({ queryKey: ['products'] })
  queryClient.invalidateQueries({ queryKey: ['punto-equilibrio'] })
}

/**
 * Hook para obtener todos los tipos de costo
 */
export const useTiposCosto = () => {
  return useQuery<TipoCosto[]>({
    queryKey: ['tipos-costo'],
    queryFn: getTiposCosto
  })
}

/**
 * Hook para obtener un tipo de costo por ID
 */
export const useTipoCosto = (id: string) => {
  return useQuery<TipoCosto>({
    queryKey: ['tipos-costo', id],
    queryFn: () => getTipoCostoById(id),
    enabled: !!id
  })
}

/**
 * Hook para crear un tipo de costo
 */
export const useCreateTipoCosto = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tipo: CreateTipoCostoRequest) => createTipoCosto(tipo),
    onSuccess: () => invalidateTipoCostoDependents(queryClient)
  })
}

/**
 * Hook para actualizar un tipo de costo
 */
export const useUpdateTipoCosto = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, tipo }: { id: string; tipo: UpdateTipoCostoRequest }) => updateTipoCosto(id, tipo),
    onSuccess: (data) => {
      invalidateTipoCostoDependents(queryClient)
      queryClient.invalidateQueries({ queryKey: ['tipos-costo', data.id] })
    }
  })
}

/**
 * Hook para eliminar un tipo de costo
 */
export const useDeleteTipoCosto = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTipoCosto(id),
    onSuccess: () => invalidateTipoCostoDependents(queryClient)
  })
}
