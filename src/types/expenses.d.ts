export interface BreakevenPorProducto {
  productId: string
  nombre: string
  precioVenta: number
  costoVariable: number
  margenContribucion: number
  margenContribucionPct: number
  soldCount: number
  puntoEquilibrioInformativo: number | null
}

export interface PuntoEquilibrio {
  costoFijoTotal: number
  global: {
    margenPromedioPonderado: number
    puntoEquilibrio: number | null
  }
  porProducto: BreakevenPorProducto[]
}

export interface Ganancias {
  fechaDesde: string | null
  fechaHasta: string | null
  ingresos: number
  gastosFijos: number
  gastosVariables: number
  inversiones: number
  egresosTotal: number
  gananciaNeta: number
}
