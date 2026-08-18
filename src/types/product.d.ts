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
  stock: number
}

export interface UpdateProductRequest {
  nombre?: string
  descripcion?: string
  tipoId?: string
  precioCosto?: number
  porcentajeGanancia?: number
  porcentajeGananciaMayorista?: number
  stock?: number
}
