import { toastManager } from '../shared/toastManager'
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

    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `venta_${id}.xlsx`;
    
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) fileName = match[1];
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
    
  } catch (error) {
    console.error('Error en la descarga:', error);
    toastManager.error('Error al descargar el archivo. Revisa la consola.');
  }
}