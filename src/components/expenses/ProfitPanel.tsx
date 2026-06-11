import React from 'react'
import type { Ganancias } from '@/types/expenses'
import { Input } from '../ui/Input'
import { formatCurrency } from '../../shared/functions'

interface ProfitPanelProps {
  fechaDesde: string
  fechaHasta: string
  onChangeDesde: (value: string) => void
  onChangeHasta: (value: string) => void
  ganancias?: Ganancias
  isLoading?: boolean
}

/**
 * Panel de Ganancias (presentacional): filtros de fecha + 4 cards de resumen
 * (Ingresos, Gastos, Inversiones, Ganancia Neta). El estado de fechas y la
 * carga de datos los maneja la página contenedora para compartirlos con la
 * exportación a Excel.
 */
export const ProfitPanel: React.FC<ProfitPanelProps> = ({
  fechaDesde,
  fechaHasta,
  onChangeDesde,
  onChangeHasta,
  ganancias,
  isLoading
}) => {
  const gananciaNeta = ganancias?.gananciaNeta ?? 0
  const gananciaPositiva = gananciaNeta >= 0
  const gastosTotales = (ganancias?.gastosFijos ?? 0) + (ganancias?.gastosVariables ?? 0)

  return (
    <div className="space-y-4">
      {/* Filtros de fecha */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Desde"
            value={fechaDesde}
            onChange={(event) => onChangeDesde(event.target.value)}
          />
          <Input
            type="date"
            label="Hasta"
            value={fechaHasta}
            onChange={(event) => onChangeHasta(event.target.value)}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Sin rango de fechas se consideran todos los ingresos e inversiones. Los
          gastos fijos y variables son recurrentes (siempre se cuentan). Este rango
          también se usa para la exportación a Excel.
        </p>
      </div>

      {/* Cards de resultado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Ingresos (Ventas)</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(ganancias?.ingresos ?? 0)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Gastos (Fijos + Var.)</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(gastosTotales)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Inversiones</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(ganancias?.inversiones ?? 0)}
          </div>
        </div>
        <div className={`rounded-lg shadow p-4 ${gananciaPositiva ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          <div className="text-sm opacity-90">Ganancia Neta</div>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : formatCurrency(gananciaNeta)}
          </div>
        </div>
      </div>
    </div>
  )
}
