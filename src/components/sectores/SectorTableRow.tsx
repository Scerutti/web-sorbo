import React from 'react'
import type { Sector } from '@/types/sector'
import { TableRow } from '../ui/Table'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

/**
 * Fila de la tabla de sectores.
 * Muestra cuántos productos tienen saldo en el sector, que es lo que decide
 * si se puede borrar: el backend responde 409 si todavía queda stock.
 * Autor: Equipo Sorbo Sabores
 */
interface SectorTableRowProps {
  sector: Sector
  productosConSaldo: number
  unidades: number
  onEdit: (sector: Sector) => void
  onDelete: (id: string) => void
}

export const SectorTableRow: React.FC<SectorTableRowProps> = ({
  sector,
  productosConSaldo,
  unidades,
  onEdit,
  onDelete
}) => {
  return (
    <TableRow>
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {sector.nombre}
        </div>
        {sector.descripcion && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {sector.descripcion}
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        {sector.activo ? (
          <Badge variant="success">Activo</Badge>
        ) : (
          <Badge variant="default">Inactivo</Badge>
        )}
      </td>
      <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
        {productosConSaldo}
      </td>
      <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
        {unidades}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(sector)}
            aria-label={`Editar ${sector.nombre}`}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(sector.id)}
            aria-label={`Eliminar ${sector.nombre}`}
          >
            Eliminar
          </Button>
        </div>
      </td>
    </TableRow>
  )
}
