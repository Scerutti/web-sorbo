import React from 'react'
import { StockSummary } from '../../shared/types'
import { Badge } from '../ui/Badge'
import { formatCurrency } from '../../shared/functions'

interface StockSummaryCardProps {
  summary: StockSummary
  totalGeneral?: number
}

/**
 * Tarjeta que muestra resumen de estados de stock
 */
export const StockSummaryCard: React.FC<StockSummaryCardProps> = ({ summary, totalGeneral }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Resumen de Stock
      </h3>
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Productos</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {summary.total}
            </span>
          </div>
          {totalGeneral !== undefined && (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total General</span>
              <span className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(totalGeneral)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="success">Bien</Badge>
              <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                {summary.good}
              </span>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              {summary.goodPercentage}%
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="warning">Quedan pocos</Badge>
              <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                {summary.low}
              </span>
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">
              {summary.lowPercentage}%
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="danger">Sin stock</Badge>
              <span className="text-2xl font-bold text-red-700 dark:text-red-400">
                {summary.out}
              </span>
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">
              {summary.outPercentage}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

