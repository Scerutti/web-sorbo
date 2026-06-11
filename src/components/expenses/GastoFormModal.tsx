import React, { useEffect, useState } from 'react'
import type { GastoBase, GastoClasificacion, CreateGastoRequest } from '@/types/gastoBase'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { formatCurrency } from '../../shared/functions'

interface GastoFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (gasto: CreateGastoRequest) => Promise<void>
  initialGasto?: GastoBase | null
}

const CLASIFICACION_OPTIONS: Array<{ value: GastoClasificacion; label: string }> = [
  { value: 'fijo', label: 'Fijo' },
  { value: 'variable', label: 'Variable' }
]

/**
 * Modal para crear/editar un gasto base (fijo o variable).
 * El valorUnitario (montoTotal / porPaquetes) se muestra calculado en vivo.
 */
export const GastoFormModal: React.FC<GastoFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialGasto
}) => {
  const [nombre, setNombre] = useState('')
  const [clasificacion, setClasificacion] = useState<GastoClasificacion>('fijo')
  const [montoTotal, setMontoTotal] = useState('')
  const [porPaquetes, setPorPaquetes] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialGasto) {
      setNombre(initialGasto.nombre)
      setClasificacion(initialGasto.clasificacion)
      setMontoTotal(initialGasto.montoTotal.toString())
      setPorPaquetes(initialGasto.porPaquetes.toString())
      setDescripcion(initialGasto.descripcion || '')
      setErrors({})
    } else {
      resetForm()
    }
  }, [initialGasto, isOpen])

  const resetForm = () => {
    setNombre('')
    setClasificacion('fijo')
    setMontoTotal('')
    setPorPaquetes('')
    setDescripcion('')
    setErrors({})
  }

  const montoNumber = parseFloat(montoTotal)
  const paquetesNumber = parseFloat(porPaquetes)
  const valorUnitario =
    !isNaN(montoNumber) && !isNaN(paquetesNumber) && paquetesNumber > 0
      ? montoNumber / paquetesNumber
      : 0

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }
    if (isNaN(montoNumber) || montoNumber < 0) {
      newErrors.montoTotal = 'El monto total debe ser mayor o igual a 0'
    }
    if (isNaN(paquetesNumber) || paquetesNumber < 1) {
      newErrors.porPaquetes = 'Los paquetes deben ser al menos 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      await onSubmit({
        nombre: nombre.trim(),
        clasificacion,
        montoTotal: montoNumber,
        porPaquetes: paquetesNumber,
        descripcion: descripcion.trim() || undefined
      })
      resetForm()
      onClose()
    } catch (error: any) {
      setErrors({ general: error?.message || 'Error al guardar el gasto' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialGasto ? 'Editar Gasto Base' : 'Nuevo Gasto Base'}
      size="md"
    >
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          error={errors.nombre}
          required
          placeholder="Ej: Luz, Alquiler, Internet"
        />

        <Select
          label="Clasificación"
          value={clasificacion}
          onChange={(event) => setClasificacion(event.target.value as GastoClasificacion)}
          options={CLASIFICACION_OPTIONS}
          helperText="Los gastos fijos componen el Costo Fijo Total del punto de equilibrio."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="number"
            label="Monto Total"
            value={montoTotal}
            onChange={(event) => setMontoTotal(event.target.value)}
            error={errors.montoTotal}
            min="0"
            step="0.01"
            required
          />
          <Input
            type="number"
            label="Por Paquetes"
            value={porPaquetes}
            onChange={(event) => setPorPaquetes(event.target.value)}
            error={errors.porPaquetes}
            min="1"
            step="1"
            required
            helperText="Unidades sobre las que se prorratea"
          />
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3 flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Valor unitario</span>
          <span className="text-lg font-semibold text-primary-600 dark:text-primary-300">
            {formatCurrency(valorUnitario)}
          </span>
        </div>

        <Input
          type="text"
          label="Descripción"
          value={descripcion}
          onChange={(event) => setDescripcion(event.target.value)}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialGasto ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
