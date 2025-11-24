import React, { useState, useEffect, useMemo } from 'react'
import { CostItem, Product, ProductType, PRODUCT_TYPE_LABEL } from '../../shared/types'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { calculateApplicableCosts, calculateProductSalePrice } from '../../shared/functions'

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (product: Omit<Product, 'id' | 'soldCount' | 'costos' | 'precioVenta' | 'precioVentaMayorista'>) => Promise<void>
  initialProduct?: Product | null
  productTypes: ProductType[]
  costItems: CostItem[]
}

/**
 * Modal para crear/editar producto
 */
export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialProduct,
  productTypes,
  costItems
}) => {
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<ProductType | ''>('')
  const [precioCosto, setPrecioCosto] = useState('')
  const [porcentajeGanancia, setPorcentajeGanancia] = useState('50')
  const [porcentajeGananciaMayorista, setPorcentajeGananciaMayorista] = useState('0')
  const [stock, setStock] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialProduct) {
      setNombre(initialProduct.nombre)
      setTipo(initialProduct.tipo)
      setPrecioCosto(initialProduct.precioCosto.toString())
      setPorcentajeGanancia(initialProduct.porcentajeGanancia.toString())
      setPorcentajeGananciaMayorista((initialProduct.porcentajeGananciaMayorista || 0).toString())
      setStock(initialProduct.stock.toString())
    } else {
      resetForm()
    }
  }, [initialProduct, isOpen])

  const resetForm = () => {
    setNombre('')
    setTipo('')
    setPrecioCosto('')
    setPorcentajeGanancia('50')
    setPorcentajeGananciaMayorista('0')
    setStock('')
    setErrors({})
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!tipo) {
      newErrors.tipo = 'El tipo es requerido'
    }

    const cost = parseFloat(precioCosto)
    if (isNaN(cost) || cost <= 0) {
      newErrors.precioCosto = 'El precio de costo debe ser mayor a 0'
    }

    const margin = parseFloat(porcentajeGanancia)
    if (isNaN(margin) || margin < 0) {
      newErrors.porcentajeGanancia = 'El porcentaje de ganancia debe ser mayor o igual a 0'
    }

    const marginMayorista = parseFloat(porcentajeGananciaMayorista)
    if (isNaN(marginMayorista) || marginMayorista < 0) {
      newErrors.porcentajeGananciaMayorista = 'El porcentaje de ganancia mayorista debe ser mayor o igual a 0'
    }

    const stockNum = parseInt(stock, 10)
    if (isNaN(stockNum) || stockNum < 0) {
      newErrors.stock = 'El stock debe ser mayor o igual a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const costosAplicados = useMemo(() => {
    if (!tipo) return 0
    return calculateApplicableCosts(costItems, tipo)
  }, [costItems, tipo])

  const precioVentaCalculado = useMemo(() => {
    const base = parseFloat(precioCosto) || 0
    const margin = parseFloat(porcentajeGanancia) || 0
    return calculateProductSalePrice(base, costosAplicados, margin)
  }, [precioCosto, porcentajeGanancia, costosAplicados])

  const precioVentaMayoristaCalculado = useMemo(() => {
    const base = parseFloat(precioCosto) || 0
    const margin = parseFloat(porcentajeGananciaMayorista) || 0
    return calculateProductSalePrice(base, costosAplicados, margin)
  }, [precioCosto, porcentajeGananciaMayorista, costosAplicados])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({
        nombre: nombre.trim(),
        tipo: tipo as ProductType,
        precioCosto: parseFloat(precioCosto),
        porcentajeGanancia: parseFloat(porcentajeGanancia),
        porcentajeGananciaMayorista: parseFloat(porcentajeGananciaMayorista) || 0,
        stock: parseInt(stock, 10)
      })
      resetForm()
      onClose()
    } catch (error: any) {
      setErrors({ general: error.message || 'Error al guardar el producto' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const typeOptions = productTypes.map(t => ({
    value: t,
    label: PRODUCT_TYPE_LABEL[t]
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialProduct ? 'Editar Producto' : 'Nuevo Producto'}
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
          onChange={(e) => setNombre(e.target.value)}
          error={errors.nombre}
          required
          aria-label="Nombre del producto"
        />

        <Select
          label="Tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as ProductType)}
          options={typeOptions}
          error={errors.tipo}
          placeholder="Seleccionar tipo"
          required
          aria-label="Tipo de producto"
        />

        <Input
          type="number"
          label="Precio de Costo"
          value={precioCosto}
          onChange={(e) => setPrecioCosto(e.target.value)}
          error={errors.precioCosto}
          min="0"
          step="0.01"
          required
          aria-label="Precio de costo"
        />

        <Input
          type="number"
          label="Porcentaje de Ganancia (%)"
          value={porcentajeGanancia}
          onChange={(e) => setPorcentajeGanancia(e.target.value)}
          error={errors.porcentajeGanancia}
          min="0"
          step="0.1"
          required
          aria-label="Porcentaje de ganancia"
        />

        <Input
          type="number"
          label="Porcentaje de Ganancia Mayoristas (%)"
          value={porcentajeGananciaMayorista}
          onChange={(e) => setPorcentajeGananciaMayorista(e.target.value)}
          error={errors.porcentajeGananciaMayorista}
          min="0"
          step="0.1"
          required
          aria-label="Porcentaje de ganancia mayoristas"
          helperText={parseFloat(porcentajeGananciaMayorista) === 0 ? "No aplica descuento mayorista" : undefined}
        />

        <Input
          type="number"
          label="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          error={errors.stock}
          min="0"
          required
          aria-label="Stock disponible"
        />

        {tipo && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Costos aplicados</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                ${costosAplicados.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Precio de venta sugerido</span>
              <span className="font-semibold text-primary-600 dark:text-primary-300">
                ${precioVentaCalculado.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Precio de venta mayorista</span>
              <span className="font-semibold text-primary-600 dark:text-primary-300">
                ${precioVentaMayoristaCalculado.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialProduct ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

