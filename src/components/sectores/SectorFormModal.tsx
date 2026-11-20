import React, { useEffect, useState } from 'react'
import type { Sector, CreateSectorRequest } from '@/types/sector'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

/**
 * Modal para crear/editar sectores.
 * Un sector es un punto de venta con su propio stock. Desactivarlo lo saca de
 * circulación sin perder el saldo ni el historial.
 * Autor: Equipo Sorbo Sabores
 */
interface SectorFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (sector: CreateSectorRequest) => Promise<void>
  initialSector?: Sector | null
}

export const SectorFormModal: React.FC<SectorFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialSector
}) => {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [activo, setActivo] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialSector) {
      setNombre(initialSector.nombre)
      setDescripcion(initialSector.descripcion || '')
      setActivo(initialSector.activo)
      setErrors({})
    } else {
      resetForm()
    }
  }, [initialSector, isOpen])

  const resetForm = () => {
    setNombre('')
    setDescripcion('')
    setActivo(true)
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
        activo
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialSector ? 'Editar sector' : 'Nuevo sector'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          value={nombre}
          onChange={event => setNombre(event.target.value)}
          error={errors.nombre}
          placeholder="Villaguay"
          autoFocus
        />

        <Input
          label="Descripción (opcional)"
          value={descripcion}
          onChange={event => setDescripcion(event.target.value)}
          placeholder="Punto de venta de Villaguay"
        />

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={activo}
            onChange={event => setActivo(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Activo
            </span>
            <span className="block text-gray-600 dark:text-gray-400">
              Un sector inactivo no admite ventas ni puede recibir stock, pero
              conserva su saldo y su historial.
            </span>
          </span>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {initialSector ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
