import React, { useState } from 'react'
import { MOCK_EXPENSES } from '../mocks/expenses'
import { PRODUCT_TYPES } from '../shared/types'
import { useProducts, useCreateProduct } from '../hooks/useProducts'
import { useSales, useCreateSale } from '../hooks/useSales'
import { useCosts } from '../hooks/useCosts'
import { useAuth } from '../providers/AuthProvider'
import { useToast } from '../providers/ToastProvider'
import { computeStockSummary } from '../shared/functions'
import { StockSummaryCard } from '../components/dashboard/StockSummaryCard'
import { TopSellingList } from '../components/dashboard/TopSellingList'
import { LeastSellingList } from '../components/dashboard/LeastSellingList'
import { PieChartGainsExpenses } from '../components/dashboard/PieChartGainsExpenses'
import { QuickActions } from '../components/dashboard/QuickActions'
import { CreateSaleModal } from '../components/sales/CreateSaleModal'
import { ProductFormModal } from '../components/products/ProductFormModal'

/**
 * Página principal del dashboard
 */
export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const { data: products = [], isLoading: isLoadingProducts } = useProducts()
  const { data: sales = [], isLoading: isLoadingSales } = useSales()
  const { data: costItems = [], isLoading: isLoadingCosts } = useCosts()
  const createSaleMutation = useCreateSale()
  const createProductMutation = useCreateProduct()
  const toast = useToast()

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)

  const isLoading = isLoadingProducts || isLoadingSales || isLoadingCosts

  const stockSummary = computeStockSummary(products)
  const displayName = user?.name || 'Usuario'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Hola <span className="font-semibold text-primary-600 dark:text-primary-400">{displayName}</span>
          </p>
        </div>
      </div>

      {/* Stock Summary */}
      <StockSummaryCard summary={stockSummary} />

      {/* Quick Actions */}
      <QuickActions
        onNewSale={() => setIsSaleModalOpen(true)}
        onNewProduct={() => setIsProductModalOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopSellingList products={products} />
        <LeastSellingList products={products} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <PieChartGainsExpenses sales={sales} expenses={MOCK_EXPENSES} />
      </div>

      {/* Modals */}
      <CreateSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSubmit={async (sale) => {
          try {
            await createSaleMutation.mutateAsync(sale)
            toast.success('Venta creada correctamente')
            setIsSaleModalOpen(false)
          } catch (error) {
            console.error('Error creando venta:', error)
            toast.error('Error al crear la venta')
          }
        }}
        products={products}
        costItems={costItems}
      />

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={async (productData) => {
          try {
            await createProductMutation.mutateAsync(productData)
            toast.success('Producto creado correctamente')
            setIsProductModalOpen(false)
          } catch (error) {
            console.error('Error creando producto:', error)
            toast.error('Error al crear el producto')
          }
        }}
        initialProduct={null}
        productTypes={PRODUCT_TYPES}
        costItems={costItems}
      />
    </div>
  )
}

