import React, { useState, useEffect } from 'react'
import { CostItem, Product, SaleItem, Sale } from '../../shared/types'
import { formatCurrency, calculateApplicableCosts, calculateProductSalePrice } from '../../shared/functions'
import { Modal } from '../ui/Modal'
import { Select } from '../ui/Select'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useAuth } from '../../providers/AuthProvider'

interface CreateSaleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (sale: Omit<Sale, 'id'>) => Promise<void>
  products: Product[]
  costItems: CostItem[]
  esMayorista?: boolean
}

interface SaleItemRow {
  productId: string
  quantity: number
  product: Product | null
}

/**
 * Modal para crear una nueva venta
 * Permite seleccionar productos, validar stock y calcular total
 */
const createEmptyItem = () => ({
  id: `item-${Date.now()}-${Math.random()}`,
  productId: '',
  quantity: 1,
  product: null as Product | null
})

export const CreateSaleModal: React.FC<CreateSaleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  products,
  costItems,
  esMayorista: initialEsMayorista = false
}) => {
  const { user } = useAuth()
  const [saleItems, setSaleItems] = useState<Array<SaleItemRow & { id: string }>>([
    createEmptyItem()
  ])
  const [esMayorista, setEsMayorista] = useState(initialEsMayorista)
  const [errors, setErrors] = useState<Partial<Record<number | 'general', string>>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Resetear formulario al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setSaleItems([createEmptyItem()])
      setEsMayorista(initialEsMayorista)
      setErrors({})
    }
  }, [isOpen, initialEsMayorista])

  const availableProducts = products.filter(p => p.stock > 0)

  const productOptions = availableProducts.map(product => ({
    value: product.id,
    label: `${product.nombre} (Stock: ${product.stock})`
  }))

  const getFinancials = (product: Product | null) => {
    if (!product) {
      return { costos: 0, precioVenta: 0, precioVentaMayorista: 0 }
    }
    const costosAplicados = calculateApplicableCosts(costItems, product.tipo)
    const precioVenta = calculateProductSalePrice(
      product.precioCosto,
      costosAplicados,
      product.porcentajeGanancia
    )
    const precioVentaMayorista = calculateProductSalePrice(
      product.precioCosto,
      costosAplicados,
      product.porcentajeGananciaMayorista || 0
    )
    return { costos: costosAplicados, precioVenta, precioVentaMayorista }
  }

  const addItem = () => {
    setSaleItems([...saleItems, createEmptyItem()])
  }

  const computeItemErrors = (items: Array<SaleItemRow & { id: string }>): Record<number, string> => {
    const result: Record<number, string> = {}
    const quantityByProduct = new Map<string, number>()

    items.forEach(item => {
      if (item.productId) {
        quantityByProduct.set(
          item.productId,
          (quantityByProduct.get(item.productId) || 0) + item.quantity
        )
      }
    })

    items.forEach((item, index) => {
      if (!item.productId) {
        result[index] = 'Debes seleccionar un producto'
        return
      }
      if (item.quantity <= 0) {
        result[index] = 'La cantidad debe ser mayor a 0'
        return
      }
      if (item.product) {
        const totalQuantity = quantityByProduct.get(item.product.id) || 0
        if (totalQuantity > item.product.stock) {
          result[index] = `Cantidad total excede el stock disponible (${item.product.stock})`
        }
      }
    })

    return result
  }

  const removeItem = (index: number) => {
    const newItems = saleItems.filter((_, i) => i !== index)
    const nextItems = newItems.length === 0 ? [createEmptyItem()] : newItems
    setSaleItems(nextItems)
    setErrors(computeItemErrors(nextItems))
  }

  const updateItem = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const newItems = [...saleItems]
    const item = newItems[index]

    if (field === 'productId') {
      item.productId = value as string
      const product = products.find(p => p.id === value)
      item.product = product || null
      // Resetear cantidad si cambia el producto
      item.quantity = 1
    } else {
      item.quantity = Math.max(1, parseInt(value as string, 10) || 1)
    }

    setSaleItems(newItems)
    setErrors(computeItemErrors(newItems))
  }

  const calculateTotal = (): number => {
    return saleItems.reduce((total, item) => {
      if (item.product) {
        const financials = getFinancials(item.product)
        const precio = esMayorista ? financials.precioVentaMayorista : financials.precioVenta
        return total + precio * item.quantity
      }
      return total
    }, 0)
  }

  const validateForm = (): boolean => {
    const itemErrors = computeItemErrors(saleItems)
    setErrors(itemErrors)
    return Object.keys(itemErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const items: SaleItem[] = saleItems
        .filter(item => item.product)
        .map(item => {
          const product = item.product!
          const financials = getFinancials(product)
          const precio = esMayorista ? financials.precioVentaMayorista : financials.precioVenta
          const snapshot: any = {
            precioCosto: product.precioCosto,
            costos: financials.costos,
            porcentajeGanancia: product.porcentajeGanancia,
            precioVenta: precio
          }
          
          // Incluir porcentajeGananciaMayorista si es venta mayorista
          if (esMayorista && product.porcentajeGananciaMayorista) {
            snapshot.porcentajeGananciaMayorista = product.porcentajeGananciaMayorista
          }
          
          return {
            productId: product.id,
            productNombre: product.nombre,
            cantidad: item.quantity,
            precioUnitario: precio,
            snapshot
          }
        })

      const total = calculateTotal()

      await onSubmit({
        fecha: new Date().toISOString(),
        items,
        total,
        esMayorista,
        vendedorId: user?.id
      })

      // Resetear y cerrar
      setSaleItems([createEmptyItem()])
      setErrors({})
      onClose()
    } catch (error: any) {
      setErrors({ general: error.message || 'Error al crear la venta' })
    } finally {
      setIsLoading(false)
    }
  }

  const total = calculateTotal()
  const hasValidItems = saleItems.some(item => item.product && item.quantity > 0)
  const hasItemErrors = Object.keys(errors).some(key => key !== 'general')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={esMayorista ? "Nueva Venta Mayorista" : "Nueva Venta"}
      size="lg"
    >
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle para venta mayorista */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <label htmlFor="esMayorista" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Venta Mayorista
            </label>
            {esMayorista && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
                MAYORISTA
              </span>
            )}
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="esMayorista"
              checked={esMayorista}
              onChange={(e) => setEsMayorista(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
          </label>
        </div>
        
        {/* Advertencia si es mayorista y algún producto no tiene porcentaje mayorista */}
        {esMayorista && saleItems.some(item => item.product && (!item.product.porcentajeGananciaMayorista || item.product.porcentajeGananciaMayorista === 0)) && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              ⚠️ Algunos productos no tienen porcentaje mayorista configurado. Se aplicará el precio normal.
            </p>
          </div>
        )}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {saleItems.map((item, index) => {
            const productFinancials = getFinancials(item.product)
            const itemError = errors[index]
            const lowerItemError = itemError?.toLowerCase()
            return (
              <div
                key={item.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3"
              >
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Producto {index + 1}
                </h4>
                {saleItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    aria-label="Eliminar producto"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <Select
                label="Producto"
                value={item.productId}
                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                options={[
                  { value: '', label: 'Seleccionar producto' },
                  ...productOptions
                ]}
                error={lowerItemError?.includes('producto') ? itemError : undefined}
                required
                aria-label={`Seleccionar producto ${index + 1}`}
              />

                {item.product && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>
                      Precio {esMayorista ? 'mayorista' : 'sugerido'}: {formatCurrency(esMayorista ? productFinancials.precioVentaMayorista : productFinancials.precioVenta)}
                      {esMayorista && productFinancials.precioVentaMayorista < productFinancials.precioVenta && (
                        <span className="ml-2 text-green-600 dark:text-green-400">
                          (Normal: {formatCurrency(productFinancials.precioVenta)})
                        </span>
                      )}
                    </p>
                    <p>Costos aplicados: {formatCurrency(productFinancials.costos)}</p>
                    <p>Stock disponible: {item.product.stock}</p>
                    {esMayorista && (!item.product.porcentajeGananciaMayorista || item.product.porcentajeGananciaMayorista === 0) && (
                      <p className="text-yellow-600 dark:text-yellow-400">⚠️ Sin descuento mayorista configurado</p>
                    )}
                  </div>
                )}

              <Input
                type="number"
                label="Cantidad"
                value={item.quantity.toString()}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                error={
                  itemError && !lowerItemError?.includes('producto')
                    ? itemError
                    : undefined
                }
                min="1"
                max={item.product?.stock || undefined}
                required
                aria-label={`Cantidad del producto ${index + 1}`}
              />

                {item.product && item.quantity > 0 && (
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Subtotal: {formatCurrency((esMayorista ? productFinancials.precioVentaMayorista : productFinancials.precioVenta) * item.quantity)}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="ghost"
            onClick={addItem}
          >
            + Agregar Producto
          </Button>

          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(total)}
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!hasValidItems || total === 0 || hasItemErrors}
          >
            {esMayorista ? 'Confirmar Venta Mayorista' : 'Confirmar Venta'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

