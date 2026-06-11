import React, { useEffect, useState } from 'react'
import type { Inversion, CreateInversionRequest } from '@/types/inversion'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface InversionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (inversion: CreateInversionRequest) => Promise<void>
  initialInversion?: Inversion | null
}

/** Devuelve la fecha (ISO) en formato YYYY-MM-DD para el input date. */
const toDateInput = (value?: string): string => {
  if (!value) return new Date().toISOString().split('T')[0]
  return new Date(value).toISOString().split('T')[0]
}

/**
 * Modal para crear/editar una inversión (gasto amortizable con fecha).
 */
export const InversionFormModal: React.FC<InversionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialInversion
}) => {
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(toDateInput())
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialInversion) {
      setDescripcion(initialInversion.descripcion)
      setMonto(initialInversion.monto.toString())
      setFecha(toDateInput(initialInversion.fecha))
      setErrors({})
    } else {
      resetForm()
    }
  }, [initialInversion, isOpen])

  const resetForm = () => {
    setDescripcion('')
    setMonto('')
    setFecha(toDateInput())
    setErrors({})
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    const montoNumber = parseFloat(monto)

    if (!descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria'
    }
    if (isNaN(montoNumber) || montoNumber < 0) {
      newErrors.monto = 'El monto debe ser mayor o igual a 0'
    }
    if (!fecha) {
      newErrors.fecha = 'La fecha es obligatoria'
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
        descripcion: descripcion.trim(),
        monto: parseFloat(monto),
        fecha: new Date(fecha).toISOString()
      })
      resetForm()
      onClose()
    } catch (error: any) {
      setErrors({ general: error?.message || 'Error al guardar la inversión' })
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
      title={initialInversion ? 'Editar Inversión' : 'Nueva Inversión'}
      size="md"
    >
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Descripción"
          value={descripcion}
          onChange={(event) => setDescripcion(event.target.value)}
          error={errors.descripcion}
          required
          placeholder="Ej: Compra de maquinaria"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="number"
            label="Monto"
            value={monto}
            onChange={(event) => setMonto(event.target.value)}
            error={errors.monto}
            min="0"
            step="0.01"
            required
          />
          <Input
            type="date"
            label="Fecha"
            value={fecha}
            onChange={(event) => setFecha(event.target.value)}
            error={errors.fecha}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialInversion ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
