import React from 'react'
import { usePuntoEquilibrio } from '../../hooks/useExpenses'
import { usePagination } from '../../hooks/usePagination'
import { Table, TableHeader, TableHead, TableRow, TableCell } from '../ui/Table'
import { Pagination } from '../ui/Pagination'
import { formatCurrency } from '../../shared/functions'

/** Redondea unidades hacia arriba (no se puede vender una fracción de unidad). */
const formatUnidades = (value: number | null): string => {
  if (value === null || !isFinite(value)) return '—'
  return `${Math.ceil(value).toLocaleString('es-AR')} u.`
}

const formatPct = (value: number): string => `${(value * 100).toFixed(1)}%`

/**
 * Panel de Punto de Equilibrio.
 * Métrica principal: PE global ponderado (el costo fijo es compartido por la
 * empresa). La tabla por producto muestra el margen de contribución de cada uno
 * para entender su aporte; el PE por producto es sólo informativo.
 */
export const BreakEvenPanel: React.FC = () => {
  const { data, isLoading } = usePuntoEquilibrio()

  // Paginación de la tabla por producto (10 por página). Se invoca siempre,
  // antes de cualquier return, para respetar las reglas de hooks.
  const porProducto = data?.porProducto ?? []
  const {
    items: pageItems,
    currentPage,
    totalPages,
    goToPage
  } = usePagination(porProducto, 10)

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-gray-500 dark:text-gray-400">
        Calculando punto de equilibrio...
      </div>
    )
  }

  if (!data) return null

  const { costoFijoTotal, global } = data

  return (
    <div className="space-y-4">
      {/* Métrica principal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-primary-600 text-white rounded-lg shadow p-5 sm:col-span-2">
          <div className="text-sm opacity-90">
            Punto de Equilibrio Global (ponderado por ventas)
          </div>
          <div className="text-3xl font-bold mt-1">
            {formatUnidades(global.puntoEquilibrio)}
          </div>
          <div className="text-sm opacity-90 mt-1">
            Unidades a vender (mix actual) para cubrir el costo fijo de la empresa.
            Margen de contribución promedio: {formatCurrency(global.margenPromedioPonderado)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div className="text-sm text-gray-600 dark:text-gray-400">Costo Fijo Total</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {formatCurrency(costoFijoTotal)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Suma de gastos clasificados como “fijo”.
          </div>
        </div>
      </div>

      {/* Detalle por producto */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Margen de contribución por producto
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Cuánto aporta cada producto a cubrir el costo fijo común.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableHead>Producto</TableHead>
              <TableHead align="right">Precio Venta</TableHead>
              <TableHead align="right">Costo Variable</TableHead>
              <TableHead align="right">Margen Contrib.</TableHead>
              <TableHead align="right">Margen %</TableHead>
              <TableHead align="right">PE individual (ref.)</TableHead>
            </TableHeader>
            <tbody>
              {pageItems.length === 0 ? (
                <TableRow>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    No hay productos cargados.
                  </td>
                </TableRow>
              ) : (
                pageItems.map((p) => (
                  <TableRow key={p.productId}>
                    <TableCell>{p.nombre}</TableCell>
                    <TableCell align="right">{formatCurrency(p.precioVenta)}</TableCell>
                    <TableCell align="right">{formatCurrency(p.costoVariable)}</TableCell>
                    <TableCell align="right" className="font-semibold text-primary-600 dark:text-primary-300">
                      {formatCurrency(p.margenContribucion)}
                    </TableCell>
                    <TableCell align="right">{formatPct(p.margenContribucionPct)}</TableCell>
                    <TableCell align="right" className="text-gray-400 dark:text-gray-500">
                      {formatUnidades(p.puntoEquilibrioInformativo)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </tbody>
          </Table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          showInfo={false}
        />
      </div>
    </div>
  )
}
