import React, { useEffect, useMemo, useState } from 'react'
import { CostType, PRODUCT_TYPE_LABEL } from '../shared/types'
import { useCosts, useCreateCost, useUpdateCost, useDeleteCost } from '../hooks/useCosts'
import { useToast } from '../providers/ToastProvider'
import { useConfirm } from '../hooks/useConfirm'
import type { CostItem } from '@/types'
import { CostFormModal } from '../components/costs/CostFormModal'
import { CostTableRow } from '../components/costs/CostTableRow'
import { Table, TableHeader, TableHead, TableRow } from '../components/ui/Table'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Badge } from '../components/ui/Badge'
import { formatCurrency } from '../shared/functions'

/**
 * Página para gestionar costos operativos.
 * Autor: Equipo Sorbo Sabores
 */
export const CostsPage: React.FC = () => {
  const { data: costs = [], isLoading } = useCosts()
  const createCostMutation = useCreateCost()
  const updateCostMutation = useUpdateCost()
  const deleteCostMutation = useDeleteCost()
  const toast = useToast()
  const { confirm, ConfirmDialog } = useConfirm()

  const [filteredCosts, setFilteredCosts] = useState<CostItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCost, setEditingCost] = useState<CostItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<CostType | ''>('')

  const typeOptions: Array<{ value: string; label: string }> = useMemo(() => [
    { value: '', label: 'Todos los tipos' },
    { value: 'general', label: 'General' },
    { value: 'blend', label: 'Blend' },
    { value: 'caja', label: 'Caja' },
    { value: 'gin', label: 'Gin' },
    { value: 'amortizable', label: 'Amortizable' }
  ], [])

  useEffect(() => {
    if (costs.length > 0) {
      setFilteredCosts(costs)
    }
  }, [costs])

  useEffect(() => {
    applyFilters()
  }, [costs, searchQuery, selectedType])

  const applyFilters = () => {
    let result = [...costs]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(cost => cost.nombre.toLowerCase().includes(query))
    }

    if (selectedType) {
      result = result.filter(cost => cost.tipo === selectedType)
    }

    setFilteredCosts(result)
  }

  const handleCreate = () => {
    setEditingCost(null)
    setIsModalOpen(true)
  }

  const handleEdit = (cost: CostItem) => {
    setEditingCost(cost)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Eliminar costo',
      message: '¿Estás seguro de eliminar este costo? Esta acción no se puede deshacer.',
      variant: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    })

    if (!confirmed) return

    try {
      await deleteCostMutation.mutateAsync(id)
      toast.success('Costo eliminado correctamente')
    } catch (error) {
      console.error('Error eliminando costo:', error)
      toast.error('No se pudo eliminar el costo')
    }
  }

  const handleSubmit = async (payload: Omit<CostItem, 'id'>) => {
    try {
      if (editingCost) {
        await updateCostMutation.mutateAsync({ id: editingCost.id, cost: payload })
        toast.success('Costo actualizado correctamente')
      } else {
        await createCostMutation.mutateAsync(payload)
        toast.success('Costo creado correctamente')
      }
      setIsModalOpen(false)
      setEditingCost(null)
    } catch (error) {
      console.error('Error guardando costo:', error)
      toast.error('No se pudo guardar el costo')
    }
  }

  const totalCost = filteredCosts.reduce((acc, cost) => acc + cost.valor, 0)

  // Determinar el título basado en el tipo seleccionado
  const pageTitle = useMemo(() => {
    if (!selectedType) return 'Costos'
    
    if (selectedType === 'general') return 'Costos Generales'
    if (selectedType === 'amortizable') return 'Costos Amortizables'
    if (selectedType === 'blend' || selectedType === 'caja' || selectedType === 'gin') {
      return PRODUCT_TYPE_LABEL[selectedType]
    }
    return 'Costos'
  }, [selectedType])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Cargando costos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{pageTitle}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los costos que impactan en el precio final de tus productos.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          Nuevo Costo
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Costos activos</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {filteredCosts.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:col-span-2 lg:col-span-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total acumulado</div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {formatCurrency(totalCost)}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="text"
            label="Buscar por nombre"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Ej: Costo general"
          />
          <Select
            label="Filtrar por tipo"
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value as CostType | '')}
            options={typeOptions}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Vista Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead align="right">Valor</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Acciones</TableHead>
            </TableHeader>
            <tbody>
              {filteredCosts.length === 0 ? (
                <TableRow>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery.trim() ? 'No se encontraron costos con ese criterio.' : 'No hay costos registrados.'}
                  </td>
                </TableRow>
              ) : (
                filteredCosts.map(cost => (
                  <CostTableRow
                    key={cost.id}
                    cost={cost}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Vista Mobile */}
        <div className="md:hidden">
          {filteredCosts.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              {searchQuery.trim() ? 'No se encontraron costos con ese criterio.' : 'No hay costos registrados.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCosts.map(cost => (
                <div key={cost.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{cost.nombre}</h3>
                      <Badge variant="info">
                        {typeOptions.find(option => option.value === cost.tipo)?.label || cost.tipo}
                      </Badge>
                    </div>
                    <div className="text-right text-lg font-semibold text-primary-600 dark:text-primary-300">
                      {formatCurrency(cost.valor)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {cost.descripcion || 'Sin descripción'}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" fullWidth onClick={() => handleEdit(cost)}>
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" fullWidth onClick={() => handleDelete(cost.id)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CostFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialCost={editingCost}
      />

      {ConfirmDialog}
    </div>
  )
}


