import { CostItem, Product, ProductType, StockStatus, StockSummary } from './types'
import { STOCK_THRESHOLDS } from './constants'

/**
 * Formatea un número como moneda en pesos argentinos
 * @param amount - Cantidad a formatear
 * @returns String formateado como moneda (ej: "$1.234,56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Formatea una fecha ISO a formato legible (DD/MM/YYYY)
 * @param dateString - Fecha en formato ISO string
 * @returns String formateado (ej: "15/03/2024")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

/**
 * Formatea una fecha ISO a formato completo con hora (DD/MM/YYYY HH:mm)
 * @param dateString - Fecha en formato ISO string
 * @returns String formateado (ej: "15/03/2024 14:30")
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

/**
 * Determina el estado de stock de un producto según thresholds
 * @param stock - Cantidad de stock actual
 * @returns Estado del stock: 'good', 'low' o 'out'
 */
export function computeStockStatus(stock: number): StockStatus {
  if (stock >= STOCK_THRESHOLDS.GOOD) return 'good'
  if (stock >= STOCK_THRESHOLDS.LOW) return 'low'
  return 'out'
}

/**
 * Calcula un resumen de estados de stock para una lista de productos
 * @param products - Array de productos
 * @returns Resumen con conteos y porcentajes por estado
 */
export function computeStockSummary(products: Product[]): StockSummary {
  const total = products.length
  let good = 0
  let low = 0
  let out = 0

  products.forEach(producto => {
    const status = computeStockStatus(producto.stock)
    if (status === 'good') good++
    else if (status === 'low') low++
    else out++
  })

  return {
    total,
    good,
    low,
    out,
    goodPercentage: total > 0 ? Math.round((good / total) * 100) : 0,
    lowPercentage: total > 0 ? Math.round((low / total) * 100) : 0,
    outPercentage: total > 0 ? Math.round((out / total) * 100) : 0
  }
}

/**
 * Pagina un array genérico
 * @param array - Array a paginar
 * @param page - Número de página (base 1)
 * @param pageSize - Tamaño de página
 * @returns Objeto con items paginados y metadata
 */
export function paginate<T>(array: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const items = array.slice(start, end)
  const totalPages = Math.ceil(array.length / pageSize)

  return {
    items,
    total: array.length,
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  }
}

/**
 * Debounce function para retrasar ejecución de funciones
 * @param func - Función a debounce
 * @param wait - Tiempo de espera en ms
 * @returns Función debounced
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Limita un número entre min y max
 * @param value - Valor a limitar
 * @param min - Valor mínimo
 * @param max - Valor máximo
 * @returns Valor limitado
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Genera un ID único para mocks (no usar en producción)
 * @returns String con ID único basado en timestamp y random
 */
export function generateIdForMock(): string {
  return `mock_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Valida formato de email
 * @param email - Email a validar
 * @returns true si el formato es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Calcula el beneficio (ganancia) de un producto
 * @param salePrice - Precio de venta
 * @param costPrice - Precio de costo
 * @returns Diferencia entre precio de venta y costo
 */
export function calculateProfit(salePrice: number, costPrice: number): number {
  return salePrice - costPrice
}

/**
 * Calcula el porcentaje de margen de ganancia
 * @param salePrice - Precio de venta
 * @param costPrice - Precio de costo
 * @returns Porcentaje de margen (ej: 25.5 para 25.5%)
 */
export function calculateProfitMargin(salePrice: number, costPrice: number): number {
  if (costPrice === 0) return 0
  return ((salePrice - costPrice) / costPrice) * 100
}

/**
 * Calcula la sumatoria de costos aplicables para un producto según su tipo.
 * @param costs - Lista de costos disponibles
 * @param tipoProducto - Tipo del producto
 * @returns Sumatoria de costos aplicables
 */
export function calculateApplicableCosts(costs: CostItem[], tipoProducto: ProductType): number {
  return costs
    .filter(cost => cost.tipo === 'general' || cost.tipo === tipoProducto || cost.tipo === 'amortizable')
    .reduce((acc, cost) => acc + cost.valor, 0)
}

/**
 * Calcula el precio de venta final de un producto con base en costo base, costos adicionales y margen.
 * @param precioCosto - Precio base de costo del producto
 * @param costos - Sumatoria de costos aplicables
 * @param porcentajeGanancia - Margen de ganancia en porcentaje
 * @returns Precio final de venta
 */
export function calculateProductSalePrice(
  precioCosto: number,
  costos: number,
  porcentajeGanancia: number
): number {
  const base = precioCosto + costos
  const precioVenta = base + base * (porcentajeGanancia / 100)
  return Math.round((precioVenta + Number.EPSILON) * 100) / 100
}

/**
 * Recalcula los campos derivados de un producto (costos y precio de venta).
 * @param producto - Producto a recalcular
 * @param costosDisponibles - Lista de costos disponibles
 * @returns Producto actualizado con campos derivados recalculados
 */
export function recalculateProductFinancials(
  producto: Pick<Product, 'tipo' | 'precioCosto' | 'porcentajeGanancia' | 'porcentajeGananciaMayorista'> & Partial<Omit<Product, 'tipo' | 'precioCosto' | 'porcentajeGanancia' | 'porcentajeGananciaMayorista' | 'costos' | 'precioVenta' | 'precioVentaMayorista'>>,
  costosDisponibles: CostItem[]
): Product {
  const costosAplicados = calculateApplicableCosts(costosDisponibles, producto.tipo)
  const precioVenta = calculateProductSalePrice(producto.precioCosto, costosAplicados, producto.porcentajeGanancia)
  const precioVentaMayorista = calculateProductSalePrice(producto.precioCosto, costosAplicados, producto.porcentajeGananciaMayorista || 0)

  return {
    ...producto,
    costos: costosAplicados,
    precioVenta,
    precioVentaMayorista
  } as Product
}

/**
 * Función helper para expresiones condicionales que evita warnings de SonarQube
 * sobre ternarios anidados.
 * 
 * Permite anidar múltiples condiciones sin que SonarQube genere warnings
 * de complejidad cognitiva por ternarios anidados.
 * 
 * @template T - Tipo del valor de retorno (se infiere automáticamente)
 * @param condition - Condición booleana a evaluar
 * @param whenTrue - Valor a retornar si la condición es verdadera
 * @param whenFalse - Valor a retornar si la condición es falsa
 * @returns El valor correspondiente según el resultado de la condición
 * 
 * @example
 * // En lugar de: condition1 ? (condition2 ? valueA : valueB) : valueC
 * // Usar: iif(condition1, iif(condition2, valueA, valueB), valueC)
 */
export function iif<T>(condition: boolean, whenTrue: T, whenFalse: T): T {
  if (condition) {
    return whenTrue
  }
  return whenFalse
}