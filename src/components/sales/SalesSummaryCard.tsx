import React from 'react'
import { formatCurrency } from '../../shared/functions'

interface SalesSummaryCardProps {
  totalCantidad: number
  totalGeneral: number
}

/**
 * Tarjeta que muestra resumen de ventas filtradas
 */
export const SalesSummaryCard: React.FC<SalesSummaryCardProps> = ({ totalCantidad, totalGeneral }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Resumen de Ventas
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total de Ventas</span>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {totalCantidad}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700 pl-0 sm:pl-6">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total General</span>
          <span className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
            {formatCurrency(totalGeneral)}
          </span>
        </div>
      </div>
    </div>
  )
}

