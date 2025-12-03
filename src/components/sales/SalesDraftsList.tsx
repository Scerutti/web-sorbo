import React from 'react'
import { SaleDraft, deleteDraft } from '../../utils/salesDrafts'
import { formatCurrency, formatDate } from '../../shared/functions'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface SalesDraftsListProps {
  drafts: SaleDraft[]
  onContinue: (draft: SaleDraft) => void
  onDelete: (draftId: string) => void
}

/**
 * Componente que muestra la lista de borradores de ventas
 */
export const SalesDraftsList: React.FC<SalesDraftsListProps> = ({ drafts, onContinue, onDelete }) => {
  if (drafts.length === 0) {
    return null
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Borradores Pendientes
          </h3>
          <Badge variant="warning">{drafts.length}</Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-700"
          >
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(draft.fecha)}
                </span>
                <Badge variant={draft.saleData.esMayorista ? "warning" : "success"}>
                  {draft.saleData.esMayorista ? "Mayorista" : "Normal"}
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {draft.saleData.items.length} {draft.saleData.items.length === 1 ? 'producto' : 'productos'}
                </span>
              </div>
              <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(draft.saleData.total)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onContinue(draft)}
              >
                Continuar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(draft.id)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

