import React, { useEffect, useMemo, useState } from 'react'
import { CostItem, CostType } from '../../shared/types'
import { useGastosBase } from '../../hooks/useExpenses'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { formatCurrency } from '../../shared/functions'

/**
 * Modal para crear/editar costos.
 * Un costo puede componerse seleccionando 1+ Gastos Base (se suman sus
 * valorUnitario automáticamente). Si no se selecciona ninguno, se ingresa el
 * valor a mano (retrocompatibilidad).
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
  const { data: gastos = [] } = useGastosBase()

  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<CostType>('general')
  const [valor, setValor] = useState('')
  const [componentes, setComponentes] = useState<string[]>([])
  const [descripcion, setDescripcion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialCost) {
      setNombre(initialCost.nombre)
      setTipo(initialCost.tipo)
      setValor(initialCost.valor.toString())
      setComponentes(initialCost.componentes ?? [])
      setDescripcion(initialCost.descripcion || '')
      setErrors({})
    } else {
      resetForm()
    }
  }, [initialCost, isOpen])

  const resetForm = () => {
    setNombre('')
    setTipo('general')
    setValor('')
    setComponentes([])
    setDescripcion('')
    setErrors({})
  }

  const isComposed = componentes.length > 0

  // Suma en vivo de los valorUnitario de los gastos base seleccionados.
  const valorCompuesto = useMemo(() => {
    return gastos
      .filter((gasto) => componentes.includes(gasto.id))
      .reduce((acc, gasto) => acc + gasto.valorUnitario, 0)
  }, [gastos, componentes])

  const toggleComponente = (id: string) => {
    setComponentes((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    if (!isComposed) {
      const valueNumber = parseFloat(valor)
      if (isNaN(valueNumber) || valueNumber <= 0) {
        newErrors.valor = 'Ingresá un valor mayor a 0 o seleccioná gastos base'
      }
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
        // El backend recalcula el valor si hay componentes; enviamos la suma
        // calculada para coherencia inmediata de la UI.
        valor: isComposed ? valorCompuesto : parseFloat(valor),
        componentes,
        descripcion: descripcion.trim() || undefined
      })
      resetForm()
      onClose()
    } catch (error: any) {
      setErrors({ general: error?.message || 'Error al guardar el costo' })
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

        {/* Composición por gastos base */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Componer con Gastos Base
            </span>
            {isComposed && (
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-300">
                {formatCurrency(valorCompuesto)}
              </span>
            )}
          </div>

          {gastos.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No hay gastos base cargados. Cargalos en “Control de Gastos/Ingresos”
              o ingresá el valor a mano abajo.
            </p>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-1">
              {gastos.map((gasto) => (
                <label
                  key={gasto.id}
                  className="flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={componentes.includes(gasto.id)}
                      onChange={() => toggleComponente(gasto.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    {gasto.nombre}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(gasto.valorUnitario)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <Input
          type="number"
          label={isComposed ? 'Valor (calculado de los gastos base)' : 'Valor'}
          value={isComposed ? valorCompuesto.toFixed(2) : valor}
          onChange={(event) => setValor(event.target.value)}
          error={errors.valor}
          min="0"
          step="0.01"
          disabled={isComposed}
          required={!isComposed}
          helperText={
            isComposed
              ? 'Se recalcula automáticamente al cambiar los gastos base.'
              : undefined
          }
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
