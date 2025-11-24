/**
 * Tipos compartidos del dominio de Sorbo Sabores.
 * Autor: Equipo Sorbo Sabores
 */

export type ProductType = 'blend' | 'caja' | 'gin'

export type CostType = 'general' | ProductType | 'amortizable'

export const PRODUCT_TYPES: ProductType[] = ['blend', 'caja', 'gin']

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  blend: 'Blend',
  caja: 'Caja',
  gin: 'Gin'
}

export interface CostItem {
  id: string
  nombre: string
  tipo: CostType
  valor: number
  descripcion?: string
}

export interface Product {
  id: string
  nombre: string
  tipo: ProductType
  precioCosto: number
  porcentajeGanancia: number
  porcentajeGananciaMayorista: number
  costos: number
  precioVenta: number
  precioVentaMayorista: number
  stock: number
  soldCount: number
}

export interface SaleCostSnapshot {
  precioCosto: number
  costos: number
  porcentajeGanancia: number
  precioVenta: number
  porcentajeGananciaMayorista?: number
}

export interface SaleItem {
  productId: string
  productNombre: string
  cantidad: number
  precioUnitario: number
  snapshot: SaleCostSnapshot
}

export interface Sale {
  id: string
  fecha: string
  items: SaleItem[]
  total: number
  esMayorista: boolean
  vendedorId?: string
}

export interface Expense {
  id: string
  date: string
  description: string
  amount: number
  category: string
}

export interface User {
  id: string
  email: string
  name: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export type StockStatus = 'good' | 'low' | 'out'

export interface StockSummary {
  total: number
  good: number
  low: number
  out: number
  goodPercentage: number
  lowPercentage: number
  outPercentage: number
}

