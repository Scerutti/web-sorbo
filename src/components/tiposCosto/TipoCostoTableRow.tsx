import React from 'react'
import type { TipoCosto } from '@/types/tipoCosto'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

/**
 * Fila de tabla para mostrar un tipo de costo.
 * Autor: Equipo Sorbo Sabores
 */
interface TipoCostoTableRowProps {
  tipo: TipoCosto
  costosAsociados: number
  onEdit: (tipo: TipoCosto) => void
  onDelete: (id: string) => void
}

export const TipoCostoTableRow: React.FC<TipoCostoTableRowProps> = ({
  tipo,
  costosAsociados,
  onEdit,
  onDelete
}) => {
  return (
    <tr className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
        {tipo.nombre}
      </td>
      <td className="px-4 py-3 text-sm">
        {tipo.aplicaATodos ? (
          <Badge variant="info">Todos los productos</Badge>
        ) : (
          <Badge variant="default">Asignable</Badge>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {costosAsociados}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {tipo.descripcion || '—'}
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(tipo)} aria-label={`Editar ${tipo.nombre}`}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(tipo.id)} aria-label={`Eliminar ${tipo.nombre}`}>
            Eliminar
          </Button>
        </div>
      </td>
    </tr>
  )
}
