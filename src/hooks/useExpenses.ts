import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getGastos,
  createGasto,
  updateGasto,
  deleteGasto,
  getInversiones,
  createInversion,
  updateInversion,
  deleteInversion,
  getPuntoEquilibrio,
  getGanancias
} from '@/api/expenses.api'
import type {
  GastoBase,
  CreateGastoRequest,
  UpdateGastoRequest
} from '@/types/gastoBase'
import type {
  Inversion,
  CreateInversionRequest,
  UpdateInversionRequest
} from '@/types/inversion'
import type { Ganancias, PuntoEquilibrio } from '@/types/expenses'

/* ------------------------------- Gastos Base ------------------------------ */

export const useGastosBase = () => {
  return useQuery<GastoBase[]>({
    queryKey: ['gastos'],
    queryFn: getGastos
  })
}

/**
 * Invalida las queries afectadas por un cambio en gastos base.
 * Los costos compuestos y, por ende, los productos dependen de estos valores.
 */
const invalidateGastoDependents = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['gastos'] })
  queryClient.invalidateQueries({ queryKey: ['costs'] })
  queryClient.invalidateQueries({ queryKey: ['products'] })
  queryClient.invalidateQueries({ queryKey: ['punto-equilibrio'] })
  queryClient.invalidateQueries({ queryKey: ['ganancias'] })
}

export const useCreateGasto = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (gasto: CreateGastoRequest) => createGasto(gasto),
    onSuccess: () => invalidateGastoDependents(queryClient)
  })
}

export const useUpdateGasto = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, gasto }: { id: string; gasto: UpdateGastoRequest }) =>
      updateGasto(id, gasto),
    onSuccess: () => invalidateGastoDependents(queryClient)
  })
}

export const useDeleteGasto = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteGasto(id),
    onSuccess: () => invalidateGastoDependents(queryClient)
  })
}

/* ------------------------------- Inversiones ------------------------------ */

export const useInversiones = (fechaDesde?: string, fechaHasta?: string) => {
  return useQuery<Inversion[]>({
    queryKey: ['inversiones', fechaDesde, fechaHasta],
    queryFn: () => getInversiones(fechaDesde, fechaHasta)
  })
}

const invalidateInversionDependents = (
  queryClient: ReturnType<typeof useQueryClient>
) => {
  queryClient.invalidateQueries({ queryKey: ['inversiones'] })
  queryClient.invalidateQueries({ queryKey: ['ganancias'] })
}

export const useCreateInversion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (inversion: CreateInversionRequest) => createInversion(inversion),
    onSuccess: () => invalidateInversionDependents(queryClient)
  })
}

export const useUpdateInversion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, inversion }: { id: string; inversion: UpdateInversionRequest }) =>
      updateInversion(id, inversion),
    onSuccess: () => invalidateInversionDependents(queryClient)
  })
}

export const useDeleteInversion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteInversion(id),
    onSuccess: () => invalidateInversionDependents(queryClient)
  })
}

/* --------------------------------- Reportes ------------------------------- */

export const usePuntoEquilibrio = () => {
  return useQuery<PuntoEquilibrio>({
    queryKey: ['punto-equilibrio'],
    queryFn: getPuntoEquilibrio
  })
}

export const useGanancias = (fechaDesde?: string, fechaHasta?: string) => {
  return useQuery<Ganancias>({
    queryKey: ['ganancias', fechaDesde, fechaHasta],
    queryFn: () => getGanancias(fechaDesde, fechaHasta)
  })
}
