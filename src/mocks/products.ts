import { Product, ProductType } from '../shared/types'
import { calculateApplicableCosts, calculateProductSalePrice, generateIdForMock } from '../shared/functions'
import { MOCK_COSTS } from './costs'

/**
 * Lista de productos mockeados para Sorbo Sabores
 * Datos generados con valores plausibles para desarrollo y testing
 * 
 * Para ajustar los datos:
 * - stock: modificar valores en array stockValues
 * - soldCount: modificar valores en array soldCounts
 * - precios: ajustar según márgenes y costos deseados
 */
const buildProduct = (
  nombre: string,
  tipo: ProductType,
  precioCosto: number,
  porcentajeGanancia: number,
  porcentajeGananciaMayorista: number,
  stock: number,
  soldCount: number
): Product => {
  const costos = calculateApplicableCosts(MOCK_COSTS, tipo)
  const precioVenta = calculateProductSalePrice(precioCosto, costos, porcentajeGanancia)
  const precioVentaMayorista = calculateProductSalePrice(precioCosto, costos, porcentajeGananciaMayorista)

  return {
    id: generateIdForMock(),
    nombre,
    tipo,
    precioCosto,
    porcentajeGanancia,
    porcentajeGananciaMayorista,
    costos,
    precioVenta,
    precioVentaMayorista,
    stock,
    soldCount
  }
}

export const MOCK_PRODUCTS: Product[] = [
  buildProduct('Blend Relajante', 'blend', 450, 60, 40, 32, 156),
  buildProduct('Blend Adelgazante', 'blend', 480, 65, 45, 18, 203),
  buildProduct('Blend Energizante', 'blend', 420, 58, 38, 45, 189),
  buildProduct('Blend Desinflamante', 'blend', 500, 62, 42, 12, 134),
  buildProduct('Blend Digestivo', 'blend', 460, 55, 35, 25, 178),
  buildProduct('Blend para Acidez', 'blend', 440, 52, 32, 8, 112),
  buildProduct('Blend Détox', 'blend', 490, 63, 43, 15, 145),
  buildProduct('Caja Premium', 'caja', 310, 70, 50, 20, 97),
  buildProduct('Caja Regalo', 'caja', 280, 68, 48, 10, 76),
  buildProduct('Gin Botánico Clásico', 'gin', 950, 45, 30, 6, 58),
  buildProduct('Gin Botánico Citrus', 'gin', 980, 48, 33, 8, 42),
  buildProduct('Gin Edición Especial', 'gin', 1100, 55, 40, 4, 25)
]

