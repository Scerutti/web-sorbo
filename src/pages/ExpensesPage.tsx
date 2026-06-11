import React, { useState } from 'react'
import type { GastoBase, CreateGastoRequest } from '@/types/gastoBase'
import type { Inversion, CreateInversionRequest } from '@/types/inversion'
import {
  useGastosBase,
  useCreateGasto,
  useUpdateGasto,
  useDeleteGasto,
  useInversiones,
  useCreateInversion,
  useUpdateInversion,
  useDeleteInversion,
  useGanancias
} from '../hooks/useExpenses'
import { exportExpensesToExcel } from '@/api/expenses.api'
import { useToast } from '../providers/ToastProvider'
import { useConfirm } from '../hooks/useConfirm'
import { GastoFormModal } from '../components/expenses/GastoFormModal'
import { InversionFormModal } from '../components/expenses/InversionFormModal'
import { ProfitPanel } from '../components/expenses/ProfitPanel'
import { BreakEvenPanel } from '../components/expenses/BreakEvenPanel'
import { Table, TableHeader, TableHead, TableRow, TableCell } from '../components/ui/Table'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatCurrency, formatDate } from '../shared/functions'

/** Convierte una fecha de input (YYYY-MM-DD) a ISO, o undefined si está vacía. */
const toIso = (value: string, endOfDay = false): string | undefined => {
  if (!value) return undefined
  const date = new Date(value)
  if (endOfDay) {
    date.setHours(23, 59, 59, 999)
  }
  return date.toISOString()
}

/**
 * Control de Gastos/Ingresos: resumen de ganancias + ABM de gastos base e
 * inversiones + exportación a Excel + punto de equilibrio / margen por producto.
 */
export const ExpensesPage: React.FC = () => {
  const toast = useToast()
  const { confirm, ConfirmDialog } = useConfirm()

  // Rango de fechas compartido por el resumen de ganancias y la exportación.
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const desdeIso = toIso(fechaDesde)
  const hastaIso = toIso(fechaHasta, true)
  const { data: ganancias, isLoading: loadingGanancias } = useGanancias(desdeIso, hastaIso)
  const [isExporting, setIsExporting] = useState(false)

  // --- Gastos base ---
  const { data: gastos = [], isLoading: loadingGastos } = useGastosBase()
  const createGasto = useCreateGasto()
  const updateGasto = useUpdateGasto()
  const deleteGasto = useDeleteGasto()
  const [isGastoModalOpen, setIsGastoModalOpen] = useState(false)
  const [editingGasto, setEditingGasto] = useState<GastoBase | null>(null)

  // --- Inversiones ---
  const { data: inversiones = [], isLoading: loadingInversiones } = useInversiones()
  const createInversion = useCreateInversion()
  const updateInversion = useUpdateInversion()
  const deleteInversion = useDeleteInversion()
  const [isInversionModalOpen, setIsInversionModalOpen] = useState(false)
  const [editingInversion, setEditingInversion] = useState<Inversion | null>(null)

  /* -------------------------------- Export ---------------------------------- */

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportExpensesToExcel(desdeIso, hastaIso)
    } finally {
      setIsExporting(false)
    }
  }

  /* ------------------------------ Gastos handlers ----------------------------- */

  const handleSubmitGasto = async (payload: CreateGastoRequest) => {
    if (editingGasto) {
      await updateGasto.mutateAsync({ id: editingGasto.id, gasto: payload })
      toast.success('Gasto actualizado correctamente')
    } else {
      await createGasto.mutateAsync(payload)
      toast.success('Gasto creado correctamente')
    }
    setEditingGasto(null)
  }

  const handleDeleteGasto = async (gasto: GastoBase) => {
    const confirmed = await confirm({
      title: 'Eliminar gasto',
      message: `¿Eliminar "${gasto.nombre}"? Los costos que lo usen como componente se recalcularán.`,
      variant: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    })
    if (!confirmed) return
    try {
      await deleteGasto.mutateAsync(gasto.id)
      toast.success('Gasto eliminado correctamente')
    } catch {
      toast.error('No se pudo eliminar el gasto')
    }
  }

  /* --------------------------- Inversiones handlers --------------------------- */

  const handleSubmitInversion = async (payload: CreateInversionRequest) => {
    if (editingInversion) {
      await updateInversion.mutateAsync({ id: editingInversion.id, inversion: payload })
      toast.success('Inversión actualizada correctamente')
    } else {
      await createInversion.mutateAsync(payload)
      toast.success('Inversión creada correctamente')
    }
    setEditingInversion(null)
  }

  const handleDeleteInversion = async (inversion: Inversion) => {
    const confirmed = await confirm({
      title: 'Eliminar inversión',
      message: `¿Eliminar "${inversion.descripcion}"? Esta acción no se puede deshacer.`,
      variant: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    })
    if (!confirmed) return
    try {
      await deleteInversion.mutateAsync(inversion.id)
      toast.success('Inversión eliminada correctamente')
    } catch {
      toast.error('No se pudo eliminar la inversión')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Control de Gastos/Ingresos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Resumen financiero, carga de gastos e inversiones, exportación y punto de equilibrio.
        </p>
      </div>

      {/* ===== (2a) Resumen: filtros de fecha + 4 cards ===== */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Resumen (Ingresos vs Egresos)
        </h2>
        <ProfitPanel
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          onChangeDesde={setFechaDesde}
          onChangeHasta={setFechaHasta}
          ganancias={ganancias}
          isLoading={loadingGanancias}
        />
      </section>

      {/* ===== (2b.1) Gastos base ===== */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Gastos Base (Fijos / Variables)
          </h2>
          <Button
            variant="primary"
            onClick={() => {
              setEditingGasto(null)
              setIsGastoModalOpen(true)
            }}
          >
            Nuevo Gasto
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableHead>Nombre</TableHead>
              <TableHead>Clasificación</TableHead>
              <TableHead align="right">Monto Total</TableHead>
              <TableHead align="right">Por Paquetes</TableHead>
              <TableHead align="right">Valor Unitario</TableHead>
              <TableHead>Acciones</TableHead>
            </TableHeader>
            <tbody>
              {loadingGastos ? (
                <TableRow>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    Cargando gastos...
                  </td>
                </TableRow>
              ) : gastos.length === 0 ? (
                <TableRow>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    No hay gastos base registrados.
                  </td>
                </TableRow>
              ) : (
                gastos.map((gasto) => (
                  <TableRow key={gasto.id}>
                    <TableCell>{gasto.nombre}</TableCell>
                    <TableCell>
                      <Badge variant={gasto.clasificacion === 'fijo' ? 'info' : 'warning'}>
                        {gasto.clasificacion === 'fijo' ? 'Fijo' : 'Variable'}
                      </Badge>
                    </TableCell>
                    <TableCell align="right">{formatCurrency(gasto.montoTotal)}</TableCell>
                    <TableCell align="right">{gasto.porPaquetes}</TableCell>
                    <TableCell align="right" className="font-semibold text-primary-600 dark:text-primary-300">
                      {formatCurrency(gasto.valorUnitario)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingGasto(gasto)
                            setIsGastoModalOpen(true)
                          }}
                        >
                          Editar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteGasto(gasto)}>
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </section>

      {/* ===== (2b.2) Inversiones ===== */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Inversiones
          </h2>
          <Button
            variant="primary"
            onClick={() => {
              setEditingInversion(null)
              setIsInversionModalOpen(true)
            }}
          >
            Nueva Inversión
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableHead>Descripción</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead align="right">Monto</TableHead>
              <TableHead>Acciones</TableHead>
            </TableHeader>
            <tbody>
              {loadingInversiones ? (
                <TableRow>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    Cargando inversiones...
                  </td>
                </TableRow>
              ) : inversiones.length === 0 ? (
                <TableRow>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    No hay inversiones registradas.
                  </td>
                </TableRow>
              ) : (
                inversiones.map((inversion) => (
                  <TableRow key={inversion.id}>
                    <TableCell>{inversion.descripcion}</TableCell>
                    <TableCell>{formatDate(inversion.fecha)}</TableCell>
                    <TableCell align="right">{formatCurrency(inversion.monto)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingInversion(inversion)
                            setIsInversionModalOpen(true)
                          }}
                        >
                          Editar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteInversion(inversion)}>
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </section>

      {/* ===== (2c) Exportar ===== */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Exportar
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Genera un Excel del período seleccionado arriba (ventas, gastos, inversiones y resumen).
          </p>
          <Button variant="secondary" onClick={handleExport} isLoading={isExporting}>
            Exportar a Excel
          </Button>
        </div>
      </section>

      {/* ===== (2d) Punto de equilibrio / margen por producto ===== */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Punto de Equilibrio
        </h2>
        <BreakEvenPanel />
      </section>

      <GastoFormModal
        isOpen={isGastoModalOpen}
        onClose={() => setIsGastoModalOpen(false)}
        onSubmit={handleSubmitGasto}
        initialGasto={editingGasto}
      />

      <InversionFormModal
        isOpen={isInversionModalOpen}
        onClose={() => setIsInversionModalOpen(false)}
        onSubmit={handleSubmitInversion}
        initialInversion={editingInversion}
      />

      {ConfirmDialog}
    </div>
  )
}
