import React from 'react'
import { Product, PRODUCT_TYPE_LABEL } from '../../shared/types'
import { formatCurrency } from '../../shared/functions'

interface TopSellingListProps {
  products: Product[]
  title?: string
  limit?: number
}

/**
 * Lista de productos más vendidos
 */
export const TopSellingList: React.FC<TopSellingListProps> = ({
  products,
  title = 'Productos Más Vendidos',
  limit = 5
}) => {
  const topProducts = [...products]
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, limit)

  if (topProducts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        {topProducts.map((product, index) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 font-semibold text-sm">
                {index + 1}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {product.nombre}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {PRODUCT_TYPE_LABEL[product.tipo]}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {product.soldCount} unidades
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(product.precioVenta)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

