// import api from '../shared/httpPrivate'
import { Sale } from '../shared/types'
import { shouldUseMocks, mockResponse } from '../mocks/serverMock'
import { getMockSales, addMockSale, updateProductStock } from '../mocks/mockStore'

/**
 * Servicio de ventas
 * Cuando VITE_USE_MOCKS=true, usa datos mockeados
 * Cuando backend esté listo, descomentar llamadas axios
 */
export const salesService = {
  /**
   * Obtiene todas las ventas
   */
  async getAll(): Promise<Sale[]> {
    if (shouldUseMocks()) {
      return mockResponse<Sale[]>(getMockSales(), 500)
    }

    // NOTE: Cuando el backend esté listo, descomentar:
    // const response = await api.get<Sale[]>('/sales')
    // return response.data

    throw new Error('getAll no implementado sin mocks')
  },

  /**
   * Obtiene una venta por ID
   */
  async getById(id: string): Promise<Sale> {
    if (shouldUseMocks()) {
      const sale = getMockSales().find(s => s.id === id)
      if (!sale) throw new Error('Venta no encontrada')
      return mockResponse<Sale>(sale, 300)
    }

    // NOTE: Cuando el backend esté listo, descomentar:
    // const response = await api.get<Sale>(`/sales/${id}`)
    // return response.data

    throw new Error('getById no implementado sin mocks')
  },

  /**
   * Crea una nueva venta
   */
  async create(sale: Omit<Sale, 'id'>): Promise<Sale> {
    if (shouldUseMocks()) {
      // Agregar venta a los mocks
      const newSale = addMockSale({
        ...sale,
        total: sale.items.reduce((acc, item) => acc + item.precioUnitario * item.cantidad, 0)
      })
      
      // Actualizar stock de productos vendidos
      sale.items.forEach(item => {
        updateProductStock(item.productId, item.cantidad)
      })
      
      return mockResponse<Sale>(newSale, 600)
    }

    // NOTE: Cuando el backend esté listo, descomentar:
    // const response = await api.post<Sale>('/sales', sale)
    // return response.data

    throw new Error('create no implementado sin mocks')
  }
}

