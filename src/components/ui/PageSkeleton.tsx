import React from 'react'

interface PageSkeletonProps {
  /** Muestra la franja de título y tarjeta. En false, sólo filas de tabla. */
  withHeader?: boolean
  rows?: number
}

/**
 * Esqueleto de una sección mientras llegan su JS o sus datos. Ocupa el lugar
 * de la página con la misma forma (título, tarjeta, tabla), así el contenido
 * aparece en su sitio en vez de reemplazar un spinner centrado.
 */
export const PageSkeleton: React.FC<PageSkeletonProps> = ({ withHeader = true, rows = 6 }) => (
  <div className="space-y-6 animate-pulse" role="status" aria-live="polite" aria-busy="true">
    <span className="sr-only">Cargando...</span>
    {withHeader && (
      <>
        <div className="h-8 w-48 rounded-md bg-gray-200 dark:bg-gray-700" />
        <div className="h-24 rounded-lg bg-gray-200 dark:bg-gray-800" />
      </>
    )}
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="h-10 bg-gray-100 dark:bg-gray-800" />
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="h-4 flex-1 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  </div>
)
