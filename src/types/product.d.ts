export interface Product {
  id: string
  nombre: string
  descripcion?: string
  /** Tipo de costo asignado: determina qué costos se le suman. */
  tipoId: string
  /** Nombre del tipo, resuelto por el backend. */
  tipoNombre: string
  precioCosto: number
  porcentajeGanancia: number
  porcentajeGananciaMayorista: number
  /** Suma de los costos aplicables. La calcula el backend. */
  costos: number
  precioVenta: number
  precioVentaMayorista: number
  /**
   * Total del emprendimiento: la suma de los saldos por sector. Lo calcula el
   * backend al leer; no es un campo que se escriba. Para cargar o mover
   * unidades hay que registrar un movimiento en la pantalla de stock.
   */
  stock: number
  soldCount: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateProductRequest {
  nombre: string
  descripcion?: string
  tipoId: string
  precioCosto: number
  porcentajeGanancia: number
  porcentajeGananciaMayorista: number
}

export interface UpdateProductRequest {
  nombre?: string
  descripcion?: string
  tipoId?: string
  precioCosto?: number
  porcentajeGanancia?: number
  porcentajeGananciaMayorista?: number
}
