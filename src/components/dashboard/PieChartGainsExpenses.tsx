import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'
import type { Ganancias } from '@/types/expenses'
import { ChartWrapper } from '../ui/ChartWrapper'
import { formatCurrency } from '../../shared/functions'

interface PieChartGainsExpensesProps {
  /** Datos reales de ganancias (ingresos por ventas vs egresos reales). */
  ganancias?: Ganancias
}

/**
 * Gráfico de pie mostrando gastos vs ganancias usando información real:
 * - "Ganancias" = ingresos por ventas (módulo Sales).
 * - "Gastos" = egresos reales (gastos fijos + variables + inversiones).
 */
export const PieChartGainsExpenses: React.FC<PieChartGainsExpensesProps> = ({
  ganancias
}) => {
  const totalGains = ganancias?.ingresos ?? 0
  const totalExpenses = ganancias?.egresosTotal ?? 0
  const netProfit = ganancias?.gananciaNeta ?? totalGains - totalExpenses

  const data = useMemo(
    () => [
      { name: 'Ganancias', value: totalGains, color: '#10b981' },
      { name: 'Gastos', value: totalExpenses, color: '#ef4444' }
    ],
    [totalGains, totalExpenses]
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Gastos vs Ganancias
      </h3>

      <ChartWrapper height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
        </PieChart>
      </ChartWrapper>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ganancias</div>
          <div className="text-xl font-bold text-green-700 dark:text-green-400">
            {formatCurrency(totalGains)}
          </div>
        </div>
        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gastos</div>
          <div className="text-xl font-bold text-red-700 dark:text-red-400">
            {formatCurrency(totalExpenses)}
          </div>
        </div>
        <div className={`text-center p-4 rounded-lg ${netProfit >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ganancia Neta</div>
          <div className={`text-xl font-bold ${netProfit >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-orange-400'}`}>
            {formatCurrency(netProfit)}
          </div>
        </div>
      </div>
    </div>
  )
}
