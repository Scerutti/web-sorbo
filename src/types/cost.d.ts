export interface CostItem {
  id: string
  nombre: string
  tipoId: string
  /** Nombre del tipo, resuelto por el backend. */
  tipoNombre: string
  valor: number
  componentes?: string[]
  descripcion?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateCostRequest {
  nombre: string
  tipoId: string
  valor?: number
  componentes?: string[]
  descripcion?: string
}

export interface UpdateCostRequest {
  nombre?: string
  tipoId?: string
  valor?: number
  componentes?: string[]
  descripcion?: string
}
