export type ProductType = 'blend' | 'caja' | 'gin'

export const PRODUCT_TYPES: ProductType[] = ['blend', 'caja', 'gin']

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  blend: 'Blend',
  caja: 'Caja',
  gin: 'Gin'
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
  createdAt?: string
  updatedAt?: string
}

export interface CreateProductRequest {
  nombre: string
  tipo: ProductType
  precioCosto: number
  porcentajeGanancia: number
  porcentajeGananciaMayorista: number
  stock: number
}

export interface UpdateProductRequest {
  nombre?: string
  tipo?: ProductType
  precioCosto?: number
  porcentajeGanancia?: number
  porcentajeGananciaMayorista?: number
  stock?: number
}

