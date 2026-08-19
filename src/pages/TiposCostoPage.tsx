import React, { useMemo, useState } from 'react'
import type { TipoCosto, CreateTipoCostoRequest } from '@/types/tipoCosto'
import {
  useTiposCosto,
  useCreateTipoCosto,
  useUpdateTipoCosto,
  useDeleteTipoCosto
} from '../hooks/useTiposCosto'
import { useCosts } from '../hooks/useCosts'
import { useToast } from '../providers/ToastProvider'
import { useConfirm } from '../hooks/useConfirm'
import { TipoCostoFormModal } from '../components/tiposCosto/TipoCostoFormModal'
import { TipoCostoTableRow } from '../components/tiposCosto/TipoCostoTableRow'
import { Table, TableHeader, TableHead, TableRow } from '../components/ui/Table'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'

/**
 * Página para administrar los tipos de costo.
 * El tipo determina qué costos se le suman a cada producto, por eso su ABM
 * vive separado del ABM de costos.
 * Autor: Equipo Sorbo Sabores
 */
export const TiposCostoPage: React.FC = () => {
  const { data: tipos = [], isLoading } = useTiposCosto()
  const { data: costs = [] } = useCosts()
  const createTipoMutation = useCreateTipoCosto()
  const updateTipoMutation = useUpdateTipoCosto()
  const deleteTipoMutation = useDeleteTipoCosto()
  const toast = useToast()
  const { confirm, ConfirmDialog } = useConfirm()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTipo, setEditingTipo] = useState<TipoCosto | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Cuántos costos usa cada tipo — sirve para anticipar el 409 al borrar.
  const costosPorTipo = useMemo(() => {
    const acc = new Map<string, number>()
    costs.forEach(cost => {
      acc.set(cost.tipoId, (acc.get(cost.tipoId) ?? 0) + 1)
    })
    return acc
  }, [costs])

  const filteredTipos = useMemo(() => {
    if (!searchQuery.trim()) return tipos
    const query = searchQuery.toLowerCase()
    return tipos.filter(tipo => tipo.nombre.toLowerCase().includes(query))
  }, [tipos, searchQuery])

  const tiposGlobales = useMemo(
    () => tipos.filter(tipo => tipo.aplicaATodos).length,
    [tipos]
  )

  const handleCreate = () => {
    setEditingTipo(null)
    setIsModalOpen(true)
  }

  const handleEdit = (tipo: TipoCosto) => {
    setEditingTipo(tipo)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    const tipo = tipos.find(t => t.id === id)
    const enUso = costosPorTipo.get(id) ?? 0

    const confirmed = await confirm({
      title: 'Eliminar tipo de costo',
      message:
        enUso > 0
          ? `"${tipo?.nombre}" está siendo usado por ${enUso} costo(s). No vas a poder eliminarlo hasta reasignarlos.`
          : `¿Estás seguro de eliminar "${tipo?.nombre}"? Esta acción no se puede deshacer.`,
      variant: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    })

    if (!confirmed) return

    try {
      await deleteTipoMutation.mutateAsync(id)
      toast.success('Tipo de costo eliminado correctamente')
    } catch (error: any) {
      console.error('Error eliminando tipo de costo:', error)
      toast.error(
        error?.response?.data?.message || 'No se pudo eliminar el tipo de costo'
      )
    }
  }

  const handleSubmit = async (payload: CreateTipoCostoRequest) => {
    if (editingTipo) {
      await updateTipoMutation.mutateAsync({ id: editingTipo.id, tipo: payload })
      toast.success('Tipo de costo actualizado correctamente')
    } else {
      await createTipoMutation.mutateAsync(payload)
      toast.success('Tipo de costo creado correctamente')
    }
    setIsModalOpen(false)
    setEditingTipo(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Cargando tipos de costo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tipos de Costo</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Cada producto elige un tipo y sólo se le suman los costos de ese tipo, más los que
            aplican a todos los productos.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          Nuevo Tipo
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Tipos definidos</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tipos.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Aplican a todos</div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{tiposGlobales}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <Input
          type="text"
          label="Buscar por nombre"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Ej: Blend"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Vista Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableHead>Nombre</TableHead>
              <TableHead>Alcance</TableHead>
              <TableHead>Costos asociados</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Acciones</TableHead>
            </TableHeader>
            <tbody>
              {filteredTipos.length === 0 ? (
                <TableRow>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery.trim()
                      ? 'No se encontraron tipos con ese criterio.'
                      : 'No hay tipos de costo registrados.'}
                  </td>
                </TableRow>
              ) : (
                filteredTipos.map(tipo => (
                  <TipoCostoTableRow
                    key={tipo.id}
                    tipo={tipo}
                    costosAsociados={costosPorTipo.get(tipo.id) ?? 0}
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
          {filteredTipos.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              {searchQuery.trim()
                ? 'No se encontraron tipos con ese criterio.'
                : 'No hay tipos de costo registrados.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTipos.map(tipo => (
                <div key={tipo.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{tipo.nombre}</h3>
                      {tipo.aplicaATodos ? (
                        <Badge variant="info">Todos los productos</Badge>
                      ) : (
                        <Badge variant="default">Asignable</Badge>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                      {costosPorTipo.get(tipo.id) ?? 0} costo(s)
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tipo.descripcion || 'Sin descripción'}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" fullWidth onClick={() => handleEdit(tipo)}>
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" fullWidth onClick={() => handleDelete(tipo.id)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TipoCostoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialTipo={editingTipo}
      />

      {ConfirmDialog}
    </div>
  )
}
