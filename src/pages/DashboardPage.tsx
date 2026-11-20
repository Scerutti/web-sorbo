import React, { useCallback, useMemo, useState } from 'react'
import { useProducts, useCreateProduct } from '../hooks/useProducts'
import { useCreateSale } from '../hooks/useSales'
import { useSaldos } from '../hooks/useStock'
import { useCosts } from '../hooks/useCosts'
import { useTiposCosto } from '../hooks/useTiposCosto'
import { useGanancias } from '../hooks/useExpenses'
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
import { PageSkeleton } from '../components/ui/PageSkeleton'

/**
 * Página principal del dashboard
 */
export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const { data: products = [], isLoading: isLoadingProducts } = useProducts()

  // Igual que en Ventas: el limite de cada linea es el saldo del sector
  // desde el que se vende, no el total del emprendimiento.
  const { data: saldos = [] } = useSaldos(
    user?.sectorId ? { sectorId: user.sectorId } : {}
  )

  const stockPorProducto = useMemo(() => {
    const acc = new Map<string, number>()
    saldos.forEach(saldo => {
      acc.set(saldo.productId, (acc.get(saldo.productId) ?? 0) + saldo.cantidad)
    })
    return acc
  }, [saldos])

  const stockDisponible = useCallback(
    (productId: string) => stockPorProducto.get(productId) ?? 0,
    [stockPorProducto]
  )
  const { data: costItems = [], isLoading: isLoadingCosts } = useCosts()
  const { data: tiposCosto = [] } = useTiposCosto()
  const { data: ganancias, isLoading: isLoadingGanancias } = useGanancias()
  const createSaleMutation = useCreateSale()
  const createProductMutation = useCreateProduct()
  const toast = useToast()

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)

  const isLoading = isLoadingProducts || isLoadingCosts || isLoadingGanancias

  const stockSummary = computeStockSummary(products)
  const displayName = user?.name || 'Usuario'

  if (isLoading) {
    return (
      <PageSkeleton />
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
        onNewSale={() => {
          // Sin sector el backend rechaza la venta: mejor avisar antes.
          if (!user?.sectorId) {
            toast.error('No tenés un sector asignado. Pedile a un admin que te asigne uno.')
            return
          }
          setIsSaleModalOpen(true)
        }}
        onNewProduct={() => setIsProductModalOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopSellingList products={products} />
        <LeastSellingList products={products} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <PieChartGainsExpenses ganancias={ganancias} />
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
        stockDisponible={stockDisponible}
      />

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={async (productData) => {
          try {
            const creado = await createProductMutation.mutateAsync(productData)
            toast.success('Producto creado correctamente')
            setIsProductModalOpen(false)
            return creado
          } catch (error: any) {
            console.error('Error creando producto:', error)
            toast.error(error?.response?.data?.message || 'Error al crear el producto')
            return undefined
          }
        }}
        initialProduct={null}
        tiposCosto={tiposCosto}
        costItems={costItems}
      />
    </div>
  )
}

