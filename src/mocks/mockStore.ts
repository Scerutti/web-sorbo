import { CostItem, Product, Sale } from '../shared/types'
import { MOCK_PRODUCTS } from './products'
import { MOCK_SALES } from './sales'
import { MOCK_COSTS } from './costs'
import { generateIdForMock, recalculateProductFinancials } from '../shared/functions'

/**
 * Store mutable para mocks durante desarrollo
 * Permite actualizar productos y ventas cuando se crean nuevas entidades
 */

/**
 * Obtiene todos los productos (referencia mutable)
 */
export function getMockProducts(): Product[] {
  return MOCK_PRODUCTS
}

/**
 * Obtiene todas las ventas (referencia mutable)
 */
export function getMockSales(): Sale[] {
  return MOCK_SALES
}

/**
 * Agrega una nueva venta a los mocks
 */
export function addMockSale(sale: Omit<Sale, 'id'>): Sale {
  const newSale: Sale = {
    ...sale,
    id: generateIdForMock()
  }
  MOCK_SALES.unshift(newSale) // Agregar al inicio
  return newSale
}

/**
 * Actualiza el stock de un producto después de una venta
 */
export function updateProductStock(productId: string, quantitySold: number): void {
  const product = MOCK_PRODUCTS.find(p => p.id === productId)
  if (product) {
    product.stock = Math.max(0, product.stock - quantitySold)
    product.soldCount = (product.soldCount || 0) + quantitySold
  }
}

/**
 * Actualiza un producto en los mocks
 */
export function updateMockProduct(id: string, updates: Partial<Product>): Product {
  const product = MOCK_PRODUCTS.find(p => p.id === id)
  if (!product) {
    throw new Error('Producto no encontrado')
  }
  const updated = {
    ...product,
    ...updates
  }
  const recalculated = recalculateProductFinancials(updated, MOCK_COSTS)
  Object.assign(product, recalculated)
  return product
}

/**
 * Agrega un nuevo producto a los mocks
 */
export function addMockProduct(product: Omit<Product, 'id' | 'soldCount' | 'costos' | 'precioVenta' | 'precioVentaMayorista'>): Product {
  const recalculated = recalculateProductFinancials(product, MOCK_COSTS)

  const newProduct: Product = {
    ...recalculated,
    id: generateIdForMock(),
    soldCount: 0
  }
  MOCK_PRODUCTS.push(newProduct)
  return newProduct
}

/**
 * Elimina un producto de los mocks
 */
export function deleteMockProduct(id: string): void {
  const index = MOCK_PRODUCTS.findIndex(product => product.id === id)
  if (index === -1) {
    throw new Error('Producto no encontrado')
  }
  MOCK_PRODUCTS.splice(index, 1)
}

/**
 * Obtiene todos los costos (referencia mutable)
 */
export function getMockCosts(): CostItem[] {
  return MOCK_COSTS
}

/**
 * Agrega un costo y recalcula productos asociados
 */
export function addMockCost(cost: Omit<CostItem, 'id'>): CostItem {
  const newCost: CostItem = {
    ...cost,
    id: generateIdForMock()
  }
  MOCK_COSTS.push(newCost)
  recalculateAllProducts()
  return newCost
}

/**
 * Actualiza un costo existente
 */
export function updateMockCost(id: string, updates: Partial<CostItem>): CostItem {
  const cost = MOCK_COSTS.find(c => c.id === id)
  if (!cost) {
    throw new Error('Costo no encontrado')
  }
  Object.assign(cost, updates)
  recalculateAllProducts()
  return cost
}

/**
 * Elimina un costo existente
 */
export function deleteMockCost(id: string): void {
  const index = MOCK_COSTS.findIndex(c => c.id === id)
  if (index === -1) {
    throw new Error('Costo no encontrado')
  }
  MOCK_COSTS.splice(index, 1)
  recalculateAllProducts()
}

/**
 * Recalcula valores financieros de todos los productos cuando los costos cambian.
 */
function recalculateAllProducts(): void {
  for (let i = 0; i < MOCK_PRODUCTS.length; i++) {
    const producto = MOCK_PRODUCTS[i]
    MOCK_PRODUCTS[i] = {
      ...recalculateProductFinancials(producto, MOCK_COSTS),
      id: producto.id,
      soldCount: producto.soldCount
    }
  }
}


