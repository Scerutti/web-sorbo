import React, { useState, useEffect } from 'react'
import { useSales, useCreateSale } from '../hooks/useSales'
import { useProducts } from '../hooks/useProducts'
import { useCosts } from '../hooks/useCosts'
import { useToast } from '../providers/ToastProvider'
import type { Sale } from '@/types'
import { SalesTable } from '../components/sales/SalesTable'
import { CreateSaleModal } from '../components/sales/CreateSaleModal'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Pagination } from '../components/ui/Pagination'
import { usePagination } from '../hooks/usePagination'
import { ITEMS_PER_PAGE } from '../shared/constants'

/**
 * Página de ventas con filtros por fecha y ordenamiento
 */
export const SalesPage: React.FC = () => {
  const { data: sales = [], isLoading: isLoadingSales } = useSales()
  const { data: products = [], isLoading: isLoadingProducts } = useProducts()
  const { data: costItems = [], isLoading: isLoadingCosts } = useCosts()
  const createSaleMutation = useCreateSale()
  const toast = useToast()

  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false)
  const [isMayoristaModal, setIsMayoristaModal] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const isLoading = isLoadingSales || isLoadingProducts || isLoadingCosts

  useEffect(() => {
    filterAndSortSales()
  }, [sales, dateFrom, dateTo, sortOrder])

  const filterAndSortSales = () => {
    let filtered = [...sales]

    if (dateFrom) {
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.fecha)
        const fromDate = new Date(dateFrom)
        return saleDate >= fromDate
      })
    }

    if (dateTo) {
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.fecha)
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        return saleDate <= toDate
      })
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.fecha).getTime()
      const dateB = new Date(b.fecha).getTime()
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })

    setFilteredSales(filtered)
  }

  const clearFilters = () => {
    setDateFrom('')
    setDateTo('')
  }

  const pagination = usePagination(filteredSales, ITEMS_PER_PAGE)

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
            Ventas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Historial de ventas realizadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => {
            setIsMayoristaModal(false)
            setIsSaleModalOpen(true)
          }}>
            Agregar Venta
          </Button>
          <Button variant="secondary" onClick={() => {
            setIsMayoristaModal(true)
            setIsSaleModalOpen(true)
          }}>
            Agregar Venta Mayorista
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="date"
            label="Desde"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Fecha desde"
          />

          <Input
            type="date"
            label="Hasta"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="Fecha hasta"
          />

          <div className="flex items-end">
            <Button variant="ghost" onClick={clearFilters} fullWidth>
              Limpiar Filtros
            </Button>
          </div>

          <div className="flex items-end">
            <Button
              variant="ghost"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              fullWidth
              aria-label={`Ordenar por fecha ${sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}
            >
              {sortOrder === 'asc' ? 'Más antiguas' : 'Más recientes'}
            </Button>
          </div>
        </div>
      </div>

      <SalesTable sales={pagination.items} />

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.goToPage}
        totalItems={pagination.total}
      />

      <CreateSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false)
          setIsMayoristaModal(false)
        }}
        onSubmit={async (sale) => {
          try {
            await createSaleMutation.mutateAsync(sale)
            toast.success(sale.esMayorista ? 'Venta mayorista creada correctamente' : 'Venta creada correctamente')
            setIsSaleModalOpen(false)
            setIsMayoristaModal(false)
          } catch (error) {
            console.error('Error creando venta:', error)
            toast.error('Error al crear la venta')
          }
        }}
        products={products}
        costItems={costItems}
        esMayorista={isMayoristaModal}
      />
    </div>
  )
}

