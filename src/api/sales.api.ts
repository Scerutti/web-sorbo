import { toastManager } from '../shared/toastManager'
import { triggerBlobDownload } from '../shared/functions'
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

/**
 * Actualiza una venta existente
 */
export const updateSale = async (id: string, sale: Partial<CreateSaleRequest>): Promise<Sale> => {
  const { data } = await axiosPrivate.patch<Sale>(`/sales/${id}`, sale)
  return data
}

/**
 * Elimina una venta
 */
export const deleteSale = async (id: string): Promise<void> => {
  await axiosPrivate.delete(`/sales/${id}`)
}

/**
 * Exporta una venta a Excel y dispara la descarga
 */
export const exportSaleToExcel = async (id: string): Promise<void> => {
  try {
    const response = await axiosPrivate.get(`/sales/${id}/export`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    });

    triggerBlobDownload(response, `venta_${id}.xlsx`);

  } catch (error) {
    console.error('Error en la descarga:', error);
    toastManager.error('Error al descargar el archivo. Revisa la consola.');
  }
}