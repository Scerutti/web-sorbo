import React, { useMemo, useState } from 'react'
import type { Sector, CreateSectorRequest } from '@/types/sector'
import {
  useSectores,
  useCreateSector,
  useUpdateSector,
  useDeleteSector
} from '../hooks/useSectores'
import { useSaldos } from '../hooks/useStock'
import { useToast } from '../providers/ToastProvider'
import { useConfirm } from '../hooks/useConfirm'
import { SectorFormModal } from '../components/sectores/SectorFormModal'
import { SectorTableRow } from '../components/sectores/SectorTableRow'
import { Table, TableHeader, TableHead, TableRow } from '../components/ui/Table'
import { Button } from '../components/ui/Button'

/**
 * Página para administrar los sectores: los puntos de venta, cada uno con su
 * propio stock. Un usuario se asigna a un sector y sus ventas descuentan de
 * ese saldo.
 * Autor: Equipo Sorbo Sabores
 */
export const SectoresPage: React.FC = () => {
  const { data: sectores = [], isLoading } = useSectores()
  const { data: saldos = [] } = useSaldos()
  const createSectorMutation = useCreateSector()
  const updateSectorMutation = useUpdateSector()
  const deleteSectorMutation = useDeleteSector()
  const toast = useToast()
  const { confirm, ConfirmDialog } = useConfirm()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSector, setEditingSector] = useState<Sector | null>(null)

  // Saldo por sector — anticipa el 409 al borrar y da contexto en la tabla.
  const resumenPorSector = useMemo(() => {
    const acc = new Map<string, { productos: number; unidades: number }>()
    saldos.forEach(saldo => {
      if (saldo.cantidad <= 0) return
      const actual = acc.get(saldo.sectorId) ?? { productos: 0, unidades: 0 }
      acc.set(saldo.sectorId, {
        productos: actual.productos + 1,
        unidades: actual.unidades + saldo.cantidad
      })
    })
    return acc
  }, [saldos])

  const handleCreate = () => {
    setEditingSector(null)
    setIsModalOpen(true)
  }

  const handleEdit = (sector: Sector) => {
    setEditingSector(sector)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    const sector = sectores.find(s => s.id === id)
    const conSaldo = resumenPorSector.get(id)

    const confirmed = await confirm({
      title: 'Eliminar sector',
      message: conSaldo
        ? `"${sector?.nombre}" tiene stock de ${conSaldo.productos} producto(s). No vas a poder eliminarlo hasta transferirlo a otro sector.`
        : `¿Estás seguro de eliminar "${sector?.nombre}"? Esta acción no se puede deshacer.`,
      variant: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    })

    if (!confirmed) return

    try {
      await deleteSectorMutation.mutateAsync(id)
      toast.success('Sector eliminado correctamente')
    } catch (error: any) {
      console.error('Error eliminando sector:', error)
      toast.error(error?.response?.data?.message || 'No se pudo eliminar el sector')
    }
  }

  const handleSubmit = async (payload: CreateSectorRequest) => {
    try {
      if (editingSector) {
        await updateSectorMutation.mutateAsync({ id: editingSector.id, sector: payload })
        toast.success('Sector actualizado correctamente')
      } else {
        await createSectorMutation.mutateAsync(payload)
        toast.success('Sector creado correctamente')
      }
      setIsModalOpen(false)
      setEditingSector(null)
    } catch (error: any) {
      console.error('Error guardando sector:', error)
      toast.error(error?.response?.data?.message || 'No se pudo guardar el sector')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Cargando sectores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Sectores
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Cada sector maneja su propio stock. Los usuarios se asignan a uno y
            sus ventas descuentan de ese saldo.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          Nuevo Sector
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableHead>Sector</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead align="right">Productos con stock</TableHead>
              <TableHead align="right">Unidades</TableHead>
              <TableHead>Acciones</TableHead>
            </TableHeader>
            <tbody>
              {sectores.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Todavía no hay sectores. Creá el primero para poder cargar
                    stock y asignarle usuarios.
                  </td>
                </TableRow>
              ) : (
                sectores.map(sector => {
                  const resumen = resumenPorSector.get(sector.id)
                  return (
                    <SectorTableRow
                      key={sector.id}
                      sector={sector}
                      productosConSaldo={resumen?.productos ?? 0}
                      unidades={resumen?.unidades ?? 0}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  )
                })
              )}
            </tbody>
          </Table>
        </div>
      </div>

      <SectorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialSector={editingSector}
      />

      {ConfirmDialog}
    </div>
  )
}
