import React from 'react'
import { Button } from '../ui/Button'

interface QuickActionsProps {
  onNewSale: () => void
  onNewProduct: () => void
}

/**
 * Acciones rápidas del dashboard
 */
export const QuickActions: React.FC<QuickActionsProps> = ({
  onNewSale,
  onNewProduct
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Acciones Rápidas
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          variant="primary"
          fullWidth
          onClick={onNewSale}
          className="h-20 flex flex-col items-center justify-center"
        >
          <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Realizar Venta
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={onNewProduct}
          className="h-20 flex flex-col items-center justify-center"
        >
          <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Cargar Producto
        </Button>
      </div>
    </div>
  )
}

