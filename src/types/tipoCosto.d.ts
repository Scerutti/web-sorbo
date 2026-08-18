export interface TipoCosto {
  id: string
  nombre: string
  descripcion?: string
  /**
   * Si es true, los costos de este tipo se suman a TODOS los productos.
   * Si es false, es un tipo asignable: sólo aplica a los productos que lo
   * seleccionaron.
   */
  aplicaATodos: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateTipoCostoRequest {
  nombre: string
  descripcion?: string
  aplicaATodos?: boolean
}

export interface UpdateTipoCostoRequest {
  nombre?: string
  descripcion?: string
  aplicaATodos?: boolean
}
