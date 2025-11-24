import { Sale, SaleItem } from '../shared/types'
import { calculateProductSalePrice, generateIdForMock } from '../shared/functions'
import { MOCK_PRODUCTS } from './products'

/**
 * Datos mockeados de ventas
 * Generados con fechas recientes y items variados
 */
const generateMockDate = (daysAgo: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

const buildSaleItem = (productIndex: number, cantidad: number): SaleItem => {
  const producto = MOCK_PRODUCTS[productIndex]
  const precioVentaActual = calculateProductSalePrice(
    producto.precioCosto,
    producto.costos,
    producto.porcentajeGanancia
  )

  return {
    productId: producto.id,
    productNombre: producto.nombre,
    cantidad,
    precioUnitario: precioVentaActual,
    snapshot: {
      precioCosto: producto.precioCosto,
      costos: producto.costos,
      porcentajeGanancia: producto.porcentajeGanancia,
      precioVenta: precioVentaActual
    }
  }
}

const buildSale = (daysAgo: number, itemsConfig: Array<[number, number]>, esMayorista: boolean = false): Sale => {
  const items = itemsConfig.map(([index, cantidad]) => buildSaleItem(index, cantidad))
  const total = items.reduce((acc, item) => acc + item.precioUnitario * item.cantidad, 0)

  return {
    id: generateIdForMock(),
    fecha: generateMockDate(daysAgo),
    items,
    total,
    esMayorista
  }
}

export const MOCK_SALES: Sale[] = [
  buildSale(0, [
    [0, 2],
    [2, 1],
    [7, 1]
  ]),
  buildSale(1, [
    [1, 2],
    [8, 1]
  ]),
  buildSale(2, [
    [2, 2]
  ]),
  buildSale(3, [
    [3, 1],
    [4, 1],
    [9, 1]
  ], true), // Venta mayorista
  buildSale(5, [
    [5, 1],
    [6, 1],
    [10, 1]
  ]),
  buildSale(7, [
    [6, 2],
    [7, 1]
  ], true), // Venta mayorista
  buildSale(10, [
    [8, 2],
    [9, 1]
  ]),
  buildSale(12, [
    [0, 1],
    [1, 1],
    [10, 1]
  ]),
  buildSale(15, [
    [2, 1],
    [4, 1],
    [5, 1]
  ], true), // Venta mayorista
  buildSale(18, [
    [3, 2]
  ]),
  buildSale(20, [
    [4, 2],
    [7, 1]
  ]),
  buildSale(22, [
    [5, 1],
    [8, 1],
    [9, 1]
  ]),
  buildSale(25, [
    [6, 1],
    [10, 1]
  ], true), // Venta mayorista
  buildSale(28, [
    [0, 1],
    [2, 1],
    [3, 1]
  ]),
  buildSale(30, [
    [1, 1],
    [4, 1],
    [6, 1]
  ])
]

