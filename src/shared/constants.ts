import type { TipoMovimiento } from '@/types/stock'
import type { UserRole } from '@/types/user'

/**
 * Thresholds para estados de stock
 * Estos valores son configurables y pueden ajustarse según las necesidades del negocio
 */
export const STOCK_THRESHOLDS = {
  GOOD: 10, // Stock >= 10 se considera "Bien"
  LOW: 1,   // Stock entre 1-9 se considera "Quedan pocos"
  OUT: 0    // Stock = 0 se considera "Sin stock"
} as const

/**
 * Items por página en tablas
 */
export const ITEMS_PER_PAGE = 20

/**
 * Delay para debounce de búsqueda (ms)
 */
export const SEARCH_DEBOUNCE_MS = 300

/**
 * Timeout para requests HTTP (ms)
 */
export const HTTP_TIMEOUT = 10000

// Los valores van aca y no en src/types: un .d.ts solo declara tipos, no
// genera JavaScript, asi que importar una constante de ahi rompe en runtime.

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

export const USER_ROLES: UserRole[] = ['admin', 'seller']

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrador',
  seller: 'Vendedor'
}
