import React from 'react'
import { CostItem } from '../../shared/types'
import { formatCurrency } from '../../shared/functions'
import { Button } from '../ui/Button'

/**
 * Fila de tabla para mostrar un costo operativo.
 * Autor: Equipo Sorbo Sabores
 */
interface CostTableRowProps {
  cost: CostItem
  onEdit: (cost: CostItem) => void
  onDelete: (id: string) => void
}

const COST_TYPE_LABEL: Record<CostItem['tipo'], string> = {
  general: 'General',
  blend: 'Blend',
  caja: 'Caja',
  gin: 'Gin',
  amortizable: 'Amortizable'
}

export const CostTableRow: React.FC<CostTableRowProps> = ({ cost, onEdit, onDelete }) => {
  return (
    <tr className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
        {cost.nombre}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {COST_TYPE_LABEL[cost.tipo]}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
        {formatCurrency(cost.valor)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {cost.descripcion || '—'}
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(cost)}
            aria-label={`Editar ${cost.nombre}`}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(cost.id)}
            aria-label={`Eliminar ${cost.nombre}`}
          >
            Eliminar
          </Button>
        </div>
      </td>
    </tr>
  )
}


