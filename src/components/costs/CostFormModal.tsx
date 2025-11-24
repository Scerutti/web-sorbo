import React, { useEffect, useState } from 'react'
import { CostItem, CostType } from '../../shared/types'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'

/**
 * Modal para crear/editar costos operativos.
 * Autor: Equipo Sorbo Sabores
 */
interface CostFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (cost: Omit<CostItem, 'id'>) => Promise<void>
  initialCost?: CostItem | null
}

const COST_TYPE_OPTIONS: Array<{ value: CostType; label: string }> = [
  { value: 'general', label: 'General' },
  { value: 'blend', label: 'Blend' },
  { value: 'caja', label: 'Caja' },
  { value: 'gin', label: 'Gin' },
  { value: 'amortizable', label: 'Amortizable' }
]

export const CostFormModal: React.FC<CostFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialCost
}) => {
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<CostType>('general')
  const [valor, setValor] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialCost) {
      setNombre(initialCost.nombre)
      setTipo(initialCost.tipo)
      setValor(initialCost.valor.toString())
      setDescripcion(initialCost.descripcion || '')
    } else {
      resetForm()
    }
  }, [initialCost, isOpen])

  const resetForm = () => {
    setNombre('')
    setTipo('general')
    setValor('')
    setDescripcion('')
    setErrors({})
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    const valueNumber = parseFloat(valor)
    if (isNaN(valueNumber) || valueNumber <= 0) {
      newErrors.valor = 'El valor debe ser mayor a 0'
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
        tipo,
        valor: parseFloat(valor),
        descripcion: descripcion.trim() || undefined
      })
      resetForm()
      onClose()
    } catch (error: any) {
      setErrors({ general: error.message || 'Error al guardar el costo' })
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
      title={initialCost ? 'Editar Costo' : 'Nuevo Costo'}
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
          aria-label="Nombre del costo"
        />

        <Select
          label="Tipo de Costo"
          value={tipo}
          onChange={(event) => setTipo(event.target.value as CostType)}
          options={COST_TYPE_OPTIONS}
          aria-label="Tipo de costo"
        />

        <Input
          type="number"
          label="Valor"
          value={valor}
          onChange={(event) => setValor(event.target.value)}
          error={errors.valor}
          min="0"
          step="0.01"
          required
          aria-label="Valor del costo"
        />

        <Input
          type="text"
          label="Descripción"
          value={descripcion}
          onChange={(event) => setDescripcion(event.target.value)}
          aria-label="Descripción del costo"
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialCost ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}


