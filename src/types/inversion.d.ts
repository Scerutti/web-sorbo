export interface Inversion {
  id: string
  descripcion: string
  monto: number
  fecha: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateInversionRequest {
  descripcion: string
  monto: number
  fecha?: string
}

export interface UpdateInversionRequest {
  descripcion?: string
  monto?: number
  fecha?: string
}
