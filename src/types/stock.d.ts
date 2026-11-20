export type TipoMovimiento = 'entrada' | 'salida' | 'transferencia' | 'ajuste'

export const TIPOS_MOVIMIENTO: TipoMovimiento[] = [
  'entrada',
  'salida',
  'transferencia',
  'ajuste'
]

export const TIPO_MOVIMIENTO_LABEL: Record<TipoMovimiento, string> = {
  entrada: 'Entrada',
  salida: 'Salida',
  transferencia: 'Transferencia',
  ajuste: 'Ajuste'
}

/** Saldo de un producto en un sector. */
export interface StockSector {
  id: string
  productId: string
  productNombre: string
  sectorId: string
  sectorNombre: string
  cantidad: number
  createdAt?: string
  updatedAt?: string
}

export interface StockResumenSector {
  sectorId: string
  sectorNombre: string
  cantidad: number
}

/** Un producto con su total y cómo se reparte entre los sectores. */
export interface StockResumen {
  productId: string
  productNombre: string
  total: number
  porSector: StockResumenSector[]
}

export interface MovimientoStock {
  id: string
  tipo: TipoMovimiento
  productId: string
  productNombre: string
  sectorOrigenId?: string
  sectorOrigenNombre?: string
  sectorDestinoId?: string
  sectorDestinoNombre?: string
  cantidad: number
  motivo?: string
  saleId?: string
  usuarioId?: string
  fecha: string
}

/**
 * Alta de un movimiento.
 *
 * En entrada, salida y transferencia `cantidad` son las unidades que se
 * mueven. En ajuste es el saldo final que debe quedar en el sector: el
 * backend calcula el delta contra el saldo actual y registra ese delta.
 */
export interface CreateMovimientoRequest {
  tipo: TipoMovimiento
  productId: string
  sectorOrigenId?: string
  sectorDestinoId?: string
  cantidad: number
  motivo?: string
}

export interface StockQuery {
  sectorId?: string
  productId?: string
}

export interface MovimientosQuery {
  productId?: string
  sectorId?: string
  tipo?: TipoMovimiento
  fechaDesde?: string
  fechaHasta?: string
  limit?: number
}
