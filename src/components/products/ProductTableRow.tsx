import React from 'react'
import { Product, PRODUCT_TYPE_LABEL } from '../../shared/types'
import { formatCurrency, computeStockStatus } from '../../shared/functions'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { TableCell } from '../ui/Table'

interface ProductTableRowProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
}

/**
 * Fila de tabla para producto
 */
export const ProductTableRow: React.FC<ProductTableRowProps> = ({
  product,
  onEdit,
  onDelete
}) => {
  const stockStatus = computeStockStatus(product.stock)
  const statusBadge = {
    good: { variant: 'success' as const, label: 'Bien' },
    low: { variant: 'warning' as const, label: 'Quedan pocos' },
    out: { variant: 'danger' as const, label: 'Sin stock' }
  }[stockStatus]

  const tipoLabel = PRODUCT_TYPE_LABEL[product.tipo]

  return (
    <tr className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
      <TableCell className="font-medium">
        {product.nombre}
      </TableCell>
      <TableCell>
        {tipoLabel}
      </TableCell>
      <TableCell align="right">
        {formatCurrency(product.precioCosto)}
      </TableCell>
      <TableCell align="right">
        {formatCurrency(product.costos)}
      </TableCell>
      <TableCell align="right">
        {formatCurrency(product.precioVenta)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          <span>{product.stock}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-2 whitespace-nowrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(product)}
            aria-label={`Editar ${product.nombre}`}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(product.id)}
            aria-label={`Eliminar ${product.nombre}`}
          >
            Eliminar
          </Button>
        </div>
      </TableCell>
    </tr>
  )
}

