import React, { useEffect, useState } from 'react'
import type { TipoCosto, CreateTipoCostoRequest } from '@/types/tipoCosto'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

/**
 * Modal para crear/editar tipos de costo.
 * Un tipo marcado como "aplica a todos" suma sus costos a todos los productos
 * (comportamiento histórico de General y Amortizable). El resto son tipos
 * asignables: sólo aplican a los productos que los seleccionan.
 * Autor: Equipo Sorbo Sabores
 */
interface TipoCostoFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (tipo: CreateTipoCostoRequest) => Promise<void>
  initialTipo?: TipoCosto | null
}

export const TipoCostoFormModal: React.FC<TipoCostoFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTipo
}) => {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [aplicaATodos, setAplicaATodos] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialTipo) {
      setNombre(initialTipo.nombre)
      setDescripcion(initialTipo.descripcion || '')
      setAplicaATodos(initialTipo.aplicaATodos)
      setErrors({})
    } else {
      resetForm()
    }
  }, [initialTipo, isOpen])

  const resetForm = () => {
    setNombre('')
    setDescripcion('')
    setAplicaATodos(false)
    setErrors({})
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    } else if (nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
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
        descripcion: descripcion.trim() || undefined,
        aplicaATodos
      })
      resetForm()
      onClose()
    } catch (error: any) {
      setErrors({
        general:
          error?.response?.data?.message || error?.message || 'Error al guardar el tipo de costo'
      })
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
      title={initialTipo ? 'Editar Tipo de Costo' : 'Nuevo Tipo de Costo'}
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
          placeholder="Ej: Blend 2"
          aria-label="Nombre del tipo de costo"
        />

        <Input
          type="text"
          label="Descripción"
          value={descripcion}
          onChange={(event) => setDescripcion(event.target.value)}
          aria-label="Descripción del tipo de costo"
        />

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={aplicaATodos}
              onChange={(event) => setAplicaATodos(event.target.checked)}
              className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>
              <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                Se aplica a todos los productos
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Los costos de este tipo se suman a todos los productos, sin necesidad de
                seleccionarlo. Usalo para costos generales o amortizables. Si lo dejás
                destildado, sólo aplica a los productos que elijan este tipo.
              </span>
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialTipo ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
