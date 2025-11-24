import { ProductType } from './product'

export type CostType = 'general' | ProductType | 'amortizable'

export interface CostItem {
  id: string
  nombre: string
  tipo: CostType
  valor: number
  descripcion?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateCostRequest {
  nombre: string
  tipo: CostType
  valor: number
  descripcion?: string
}

export interface UpdateCostRequest {
  nombre?: string
  tipo?: CostType
  valor?: number
  descripcion?: string
}

