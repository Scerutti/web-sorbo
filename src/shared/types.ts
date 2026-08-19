/**
 * Tipos compartidos del dominio de Sorbo Sabores.
 *
 * Las entidades de dominio (Product, CostItem, TipoCosto) viven en `src/types/`
 * y se re-exportan acá para que los componentes que importan desde
 * `../shared/types` y la capa de api/hooks que importa desde `@/types` usen
 * exactamente la misma definición.
 * Autor: Equipo Sorbo Sabores
 */

export type { Product } from '@/types/product'
export type { CostItem } from '@/types/cost'
export type { TipoCosto } from '@/types/tipoCosto'

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
