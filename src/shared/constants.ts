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

