export type GastoClasificacion = 'fijo' | 'variable'

export interface GastoBase {
  id: string
  nombre: string
  clasificacion: GastoClasificacion
  montoTotal: number
  porPaquetes: number
  valorUnitario: number
  descripcion?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateGastoRequest {
  nombre: string
  clasificacion: GastoClasificacion
  montoTotal: number
  porPaquetes: number
  descripcion?: string
}

export interface UpdateGastoRequest {
  nombre?: string
  clasificacion?: GastoClasificacion
  montoTotal?: number
  porPaquetes?: number
  descripcion?: string
}
