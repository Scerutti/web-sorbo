// import api from '../shared/httpPrivate'
import { Product } from '../shared/types'
import { shouldUseMocks, mockResponse } from '../mocks/serverMock'
import { getMockProducts, addMockProduct, updateMockProduct, deleteMockProduct } from '../mocks/mockStore'

type ProductPayload = Omit<Product, 'id' | 'soldCount' | 'costos' | 'precioVenta'>

/**
 * Servicio de productos
 * Cuando VITE_USE_MOCKS=true, usa datos mockeados
 * Cuando backend esté listo, descomentar llamadas axios
 */
export const productsService = {
  /**
   * Obtiene todos los productos
   */
  async getAll(): Promise<Product[]> {
    if (shouldUseMocks()) {
      return mockResponse<Product[]>(getMockProducts(), 500)
    }

    // NOTE: Cuando el backend esté listo, descomentar:
    // const response = await api.get<Product[]>('/products')
    // return response.data

    throw new Error('getAll no implementado sin mocks')
  },

  /**
   * Obtiene un producto por ID
   */
  async getById(id: string): Promise<Product> {
    if (shouldUseMocks()) {
      const product = getMockProducts().find(p => p.id === id)
      if (!product) throw new Error('Producto no encontrado')
      return mockResponse<Product>(product, 300)
    }

    // NOTE: Cuando el backend esté listo, descomentar:
    // const response = await api.get<Product>(`/products/${id}`)
    // return response.data

    throw new Error('getById no implementado sin mocks')
  },

  /**
   * Crea un nuevo producto
   */
  async create(product: ProductPayload): Promise<Product> {
    if (shouldUseMocks()) {
      const newProduct = addMockProduct(product)
      return mockResponse<Product>(newProduct, 600)
    }

    // NOTE: Cuando el backend esté listo, descomentar:
    // const response = await api.post<Product>('/products', product)
    // return response.data

    throw new Error('create no implementado sin mocks')
  },

  /**
   * Actualiza un producto existente
   */
  async update(id: string, product: Partial<ProductPayload>): Promise<Product> {
    if (shouldUseMocks()) {
      const updated = updateMockProduct(id, product)
      return mockResponse<Product>(updated, 500)
    }

    // NOTE: Cuando el backend esté listo, descomentar:
    // const response = await api.put<Product>(`/products/${id}`, product)
    // return response.data

    throw new Error('update no implementado sin mocks')
  },

  /**
   * Elimina un producto
   */
  async delete(id: string): Promise<void> {
    if (shouldUseMocks()) {
      deleteMockProduct(id)
      return mockResponse<void>(undefined, 400)
    }

    // NOTE: Cuando el backend esté listo, descomentar:
    // await api.delete(`/products/${id}`)
  }
}

