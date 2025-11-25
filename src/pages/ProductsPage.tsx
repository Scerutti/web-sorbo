import React, { useState, useEffect, useMemo } from 'react'
import { ProductType, PRODUCT_TYPE_LABEL, PRODUCT_TYPES } from '../shared/types'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts'
import { useCosts } from '../hooks/useCosts'
import { useToast } from '../providers/ToastProvider'
import { useConfirm } from '../hooks/useConfirm'
import { computeStockSummary, debounce, computeStockStatus, formatCurrency, recalculateProductFinancials, iif } from '../shared/functions'
import type { Product } from '@/types'
import { StockSummaryCard } from '../components/dashboard/StockSummaryCard'
import { ProductFilters } from '../components/products/ProductFilters'
import { ProductTableRow } from '../components/products/ProductTableRow'
import { ProductFormModal } from '../components/products/ProductFormModal'
import { Table, TableHeader, TableHead, TableRow } from '../components/ui/Table'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Pagination } from '../components/ui/Pagination'
import { usePagination } from '../hooks/usePagination'
import { ITEMS_PER_PAGE } from '../shared/constants'

/**
 * Página de productos con filtros, búsqueda, ordenamiento y paginación
 */
export const ProductsPage: React.FC = () => {
  const { data: products = [], isLoading: isLoadingProducts } = useProducts()
  const { data: costItems = [], isLoading: isLoadingCosts } = useCosts()
  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()
  const deleteProductMutation = useDeleteProduct()
  const toast = useToast()
  const { confirm, ConfirmDialog } = useConfirm()

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<ProductType | ''>('')
  const [sortBy, setSortBy] = useState<'nombre' | 'stock'>('nombre')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const isLoading = isLoadingProducts || isLoadingCosts

  // Recalcular costos de productos basados en los costos disponibles
  const productsWithRecalculatedCosts = useMemo(() => {
    if (costItems.length === 0) return products
    return products.map(product => 
      recalculateProductFinancials(product, costItems)
    )
  }, [products, costItems])

  const availableProductTypes = useMemo(() => {
    const presentTypes = new Set(productsWithRecalculatedCosts.map(p => p.tipo))
    return PRODUCT_TYPES.filter(type => presentTypes.has(type))
  }, [productsWithRecalculatedCosts])

  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      filterProducts(query, selectedType)
    }, 300),
    [selectedType]
  )

  useEffect(() => {
    if (productsWithRecalculatedCosts.length > 0) {
      setFilteredProducts(productsWithRecalculatedCosts)
    }
  }, [productsWithRecalculatedCosts])

  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery, debouncedSearch])

  useEffect(() => {
    filterProducts(searchQuery, selectedType)
  }, [selectedType, productsWithRecalculatedCosts])

  const filterProducts = (query: string, type: ProductType | '') => {
    let filtered = [...productsWithRecalculatedCosts]

    if (query.trim()) {
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(query.toLowerCase())
      )
    }

    if (type) {
      filtered = filtered.filter(p => p.tipo === type)
    }

    setFilteredProducts(filtered)
  }

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'nombre') {
        // Ordenamiento alfabético por nombre
        const nameA = a.nombre.toLowerCase()
        const nameB = b.nombre.toLowerCase()
        if (sortOrder === 'asc') {
          return nameA.localeCompare(nameB, 'es')
        } else {
          return nameB.localeCompare(nameA, 'es')
        }
      } else {
        // Ordenamiento por stock
        return sortOrder === 'asc' ? a.stock - b.stock : b.stock - a.stock
      }
    })
  }, [filteredProducts, sortBy, sortOrder])

  const pagination = usePagination(sortedProducts, ITEMS_PER_PAGE)

  const handleCreate = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (productId: string) => {
    const confirmed = await confirm({
      title: 'Eliminar producto',
      message: '¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.',
      variant: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    })

    if (!confirmed) {
      return
    }

    try {
      await deleteProductMutation.mutateAsync(productId)
      toast.success('Producto eliminado correctamente')
    } catch (error) {
      console.error('Error eliminando producto:', error)
      toast.error('Error al eliminar el producto')
    }
  }

  const handleSubmit = async (
    productData: Omit<Product, 'id' | 'soldCount' | 'costos' | 'precioVenta' | 'precioVentaMayorista'>
  ) => {
    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({ id: editingProduct.id, product: productData })
        toast.success('Producto actualizado correctamente')
      } else {
        await createProductMutation.mutateAsync(productData)
        toast.success('Producto creado correctamente')
      }
      setIsModalOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Error guardando producto:', error)
      toast.error('Error al guardar el producto')
    }
  }

  const stockSummary = computeStockSummary(productsWithRecalculatedCosts)

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
            Productos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona tu inventario de productos
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          Cargar Producto
        </Button>
      </div>

      <StockSummaryCard summary={stockSummary} />

      <ProductFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={(value) => setSelectedType(value)}
        productTypes={availableProductTypes}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
              <col className="w-[20%]" />
            </colgroup>
            <TableHeader>
              <TableHead>
                <div className="flex items-center gap-2">
                  <span>Nombre</span>
                  <button
                    onClick={() => {
                      if (sortBy === 'nombre') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortBy('nombre')
                        setSortOrder('asc')
                      }
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
                    aria-label={`Ordenar por nombre ${sortBy === 'nombre' && sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}
                    title={`Ordenar por nombre ${sortBy === 'nombre' && sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}
                  >
                    {iif(
                      sortBy === 'nombre' && sortOrder === 'asc',
                      <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>,
                      iif(
                        sortBy === 'nombre' && sortOrder === 'desc',
                        <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>,
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      )
                    )}
                  </button>
                </div>
              </TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead align="right">Precio Costo</TableHead>
              <TableHead align="right">Costos</TableHead>
              <TableHead align="right">Precio Venta</TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <span>Stock</span>
                  <button
                    onClick={() => {
                      if (sortBy === 'stock') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortBy('stock')
                        setSortOrder('asc')
                      }
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    aria-label={`Ordenar por stock ${sortBy === 'stock' && sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}
                  >
                    {iif(
                      sortBy === 'stock' && sortOrder === 'asc',
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>,
                      iif(
                        sortBy === 'stock' && sortOrder === 'desc',
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>,
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      )
                    )}
                  </button>
                </div>
              </TableHead>
              <TableHead>Acciones</TableHead>
            </TableHeader>
            <tbody>
              {pagination.items.length === 0 ? (
                <TableRow>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery.trim() ? (
                      <>No se encontró producto con nombre &apos;{searchQuery}&apos;</>
                    ) : (
                      'No hay productos disponibles'
                    )}
                  </td>
                </TableRow>
              ) : (
                pagination.items.map(product => (
                  <ProductTableRow
                    key={product.id}
                    product={product}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {pagination.items.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              {searchQuery.trim() ? (
                <>No se encontró producto con nombre &apos;{searchQuery}&apos;</>
              ) : (
                'No hay productos disponibles'
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {pagination.items.map(product => {
                const stockStatus = computeStockStatus(product.stock)
                const statusBadge = {
                  good: { variant: 'success' as const, label: 'Bien' },
                  low: { variant: 'warning' as const, label: 'Quedan pocos' },
                  out: { variant: 'danger' as const, label: 'Sin stock' }
                }[stockStatus]

                return (
                  <div
                    key={product.id}
                    className="p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-1">
                          {product.nombre}
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Tipo: {PRODUCT_TYPE_LABEL[product.tipo]}
                        </div>
                      </div>
                      <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Precio Costo:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(product.precioCosto)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Costos:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(product.costos)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Precio Venta:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(product.precioVenta)}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                        <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
                          {product.stock} unidades
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        fullWidth
                        aria-label={`Editar ${product.nombre}`}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        fullWidth
                        aria-label={`Eliminar ${product.nombre}`}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.goToPage}
          totalItems={pagination.total}
        />
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialProduct={editingProduct}
        productTypes={PRODUCT_TYPES}
        costItems={costItems}
      />

      {ConfirmDialog}
    </div>
  )
}

