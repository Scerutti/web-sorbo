import { toastManager } from '../shared/toastManager'
import { triggerBlobDownload } from '../shared/functions'
import { axiosPrivate } from './http'
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

export const getGastos = async (): Promise<GastoBase[]> => {
  const { data } = await axiosPrivate.get<GastoBase[]>('/expenses/gastos')
  return data
}

export const createGasto = async (gasto: CreateGastoRequest): Promise<GastoBase> => {
  const { data } = await axiosPrivate.post<GastoBase>('/expenses/gastos', gasto)
  return data
}

export const updateGasto = async (
  id: string,
  gasto: UpdateGastoRequest
): Promise<GastoBase> => {
  const { data } = await axiosPrivate.patch<GastoBase>(`/expenses/gastos/${id}`, gasto)
  return data
}

export const deleteGasto = async (id: string): Promise<void> => {
  await axiosPrivate.delete(`/expenses/gastos/${id}`)
}

/* ------------------------------- Inversiones ------------------------------ */

export const getInversiones = async (
  fechaDesde?: string,
  fechaHasta?: string
): Promise<Inversion[]> => {
  const { data } = await axiosPrivate.get<Inversion[]>('/expenses/inversiones', {
    params: { fechaDesde, fechaHasta }
  })
  return data
}

export const createInversion = async (
  inversion: CreateInversionRequest
): Promise<Inversion> => {
  const { data } = await axiosPrivate.post<Inversion>('/expenses/inversiones', inversion)
  return data
}

export const updateInversion = async (
  id: string,
  inversion: UpdateInversionRequest
): Promise<Inversion> => {
  const { data } = await axiosPrivate.patch<Inversion>(
    `/expenses/inversiones/${id}`,
    inversion
  )
  return data
}

export const deleteInversion = async (id: string): Promise<void> => {
  await axiosPrivate.delete(`/expenses/inversiones/${id}`)
}

/* --------------------------------- Reportes ------------------------------- */

export const getPuntoEquilibrio = async (): Promise<PuntoEquilibrio> => {
  const { data } = await axiosPrivate.get<PuntoEquilibrio>(
    '/expenses/punto-equilibrio'
  )
  return data
}

export const getGanancias = async (
  fechaDesde?: string,
  fechaHasta?: string
): Promise<Ganancias> => {
  const { data } = await axiosPrivate.get<Ganancias>('/expenses/ganancias', {
    params: { fechaDesde, fechaHasta }
  })
  return data
}

/**
 * Exporta el reporte mensual de gastos/ingresos a Excel y dispara la descarga.
 */
export const exportExpensesToExcel = async (
  fechaDesde?: string,
  fechaHasta?: string
): Promise<void> => {
  try {
    const response = await axiosPrivate.get('/expenses/export', {
      responseType: 'blob',
      params: { fechaDesde, fechaHasta },
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    })

    triggerBlobDownload(response, 'reporte_gastos.xlsx')
  } catch (error) {
    console.error('Error en la descarga:', error)
    toastManager.error('Error al descargar el reporte. Revisa la consola.')
  }
}
