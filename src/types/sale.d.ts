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
  /** Sector del que salio el stock. Ausente en ventas anteriores al cambio. */
  sectorId?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateSaleRequest {
  fecha: string
  items: SaleItem[]
  total: number
  esMayorista: boolean
  vendedorId?: string
}

