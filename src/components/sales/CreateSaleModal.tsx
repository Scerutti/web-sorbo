import React, { useState, useEffect, useRef } from 'react'
import { CostItem, Product, SaleItem, Sale } from '../../shared/types'
import { formatCurrency, calculateApplicableCosts, calculateProductSalePrice } from '../../shared/functions'
import { Modal } from '../ui/Modal'
import { Autocomplete } from '../ui/Autocomplete'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { useAuth } from '../../providers/AuthProvider'
import { SaleDraft, saveDraft, generateDraftId } from '../../utils/salesDrafts'

interface CreateSaleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (sale: Omit<Sale, 'id'>) => Promise<void>
  products: Product[]
  costItems: CostItem[]
  esMayorista?: boolean
  initialSale?: Sale // Para modo edición
  draft?: SaleDraft // Borrador a cargar
  onDraftSaved?: () => void // Callback cuando se guarda un borrador
  onDraftDeleted?: () => void // Callback cuando se elimina un borrador (al confirmar)
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
  esMayorista: initialEsMayorista = false,
  initialSale,
  draft,
  onDraftSaved,
  onDraftDeleted
}) => {
  const { user } = useAuth()
  const isEditMode = !!initialSale
  const draftIdRef = useRef<string | null>(draft?.id || null)
  
  // Inicializar items desde la venta existente si estamos en modo edición
  const initializeItems = (): Array<SaleItemRow & { id: string }> => {
    if (initialSale && initialSale.items.length > 0) {
      return initialSale.items.map((item, index) => ({
        id: `item-${initialSale.id}-${index}`,
        productId: item.productId,
        quantity: item.cantidad,
        product: products.find(p => p.id === item.productId) || null
      }))
    }
    return [createEmptyItem()]
  }

  const [saleItems, setSaleItems] = useState<Array<SaleItemRow & { id: string }>>(initializeItems)
  const [esMayorista, setEsMayorista] = useState(initialSale?.esMayorista ?? initialEsMayorista)
  const [errors, setErrors] = useState<Partial<Record<number | 'general', string>>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showExitConfirmDialog, setShowExitConfirmDialog] = useState(false)
  const [showCancelConfirmDialog, setShowCancelConfirmDialog] = useState(false)
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Resetear formulario al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      if (initialSale && products.length > 0) {
        // Modo edición: cargar datos de la venta
        const items = initialSale.items.map((item, index) => ({
          id: `item-${initialSale.id}-${index}`,
          productId: item.productId,
          quantity: item.cantidad,
          product: products.find(p => p.id === item.productId) || null
        }))
        setSaleItems(items.length > 0 ? items : [createEmptyItem()])
        setEsMayorista(initialSale.esMayorista)
        draftIdRef.current = null // No usar borrador en modo edición
      } else if (draft && products.length > 0) {
        // Cargar borrador
        const items = draft.saleData.items.map((item, index) => ({
          id: `item-draft-${index}`,
          productId: item.productId,
          quantity: item.quantity,
          product: products.find(p => p.id === item.productId) || null
        }))
        setSaleItems(items.length > 0 ? items : [createEmptyItem()])
        setEsMayorista(draft.saleData.esMayorista)
        draftIdRef.current = draft.id
      } else {
        // Modo creación: resetear
        setSaleItems([createEmptyItem()])
        setEsMayorista(initialEsMayorista)
        draftIdRef.current = null
      }
      setErrors({})
    }
  }, [isOpen, initialEsMayorista, initialSale, draft, products])

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
    const newItem = createEmptyItem()
    setSaleItems([...saleItems, newItem])
    
    // Hacer scroll al nuevo item después de que se renderice
    setTimeout(() => {
      const element = itemRefs.current.get(newItem.id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }, 100)
  }

  const computeItemErrors = (items: Array<SaleItemRow & { id: string }>): Record<number, string> => {
    const result: Record<number, string> = {}
    
    // Validaciones básicas (producto seleccionado, cantidad válida)
    items.forEach((item, index) => {
      if (!item.productId) {
        result[index] = 'Debes seleccionar un producto'
        return
      }
      if (item.quantity <= 0) {
        result[index] = 'La cantidad debe ser mayor a 0'
        return
      }
    })

    // Si hay errores básicos, no continuar con validación de stock
    if (Object.keys(result).length > 0) {
      return result
    }

    // Validación de stock
    if (isEditMode && initialSale) {
      // MODO EDICIÓN: Validar solo diferencias o items nuevos
      // El backend restaurará el stock de items originales antes de aplicar cambios
      
      // Crear mapa de cantidades originales por producto
      const originalQuantities = new Map<string, number>()
      initialSale.items.forEach(originalItem => {
        originalQuantities.set(
          originalItem.productId,
          (originalQuantities.get(originalItem.productId) || 0) + originalItem.cantidad
        )
      })

      // Crear mapa de cantidades nuevas por producto
      const newQuantities = new Map<string, number>()
      items.forEach(item => {
        if (item.productId) {
          newQuantities.set(
            item.productId,
            (newQuantities.get(item.productId) || 0) + item.quantity
          )
        }
      })

      // Validar cada producto: calcular diferencia y validar contra stock actual
      newQuantities.forEach((newQty, productId) => {
        const originalQty = originalQuantities.get(productId) || 0
        const difference = newQty - originalQty
        
        // Si no hay diferencia, no validar (el backend restaurará y volverá a aplicar la misma cantidad)
        if (difference === 0) {
          return
        }

        const product = products.find(p => p.id === productId)
        if (!product) {
          return
        }

        // Calcular stock disponible: stock actual + cantidad a restaurar (si es positiva)
        const stockAvailable = product.stock + (difference < 0 ? 0 : originalQty)
        
        // Si la diferencia es positiva (aumentamos cantidad), validar contra stock disponible
        if (difference > 0 && difference > stockAvailable) {
          // Encontrar todos los índices de items con este producto para mostrar el error
          items.forEach((item, index) => {
            if (item.productId === productId && !result[index]) {
              result[index] = `Cantidad excede el stock disponible. Stock actual: ${product.stock}, cantidad original: ${originalQty}, diferencia requerida: ${difference}`
            }
          })
        }
        // Si la diferencia es negativa (reducimos cantidad), no hay problema de stock
      })

      // Validar items nuevos (productos que no estaban en la venta original)
      items.forEach((item, index) => {
        if (item.productId && item.product && !originalQuantities.has(item.productId)) {
          // Es un producto nuevo, validar contra stock actual
          if (item.quantity > item.product.stock) {
            result[index] = `Cantidad excede el stock disponible (${item.product.stock})`
          }
        }
      })
    } else {
      // MODO CREACIÓN: Validar normalmente (suma total de cantidades por producto)
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
        if (item.product) {
          const totalQuantity = quantityByProduct.get(item.product.id) || 0
          if (totalQuantity > item.product.stock) {
            result[index] = `Cantidad total excede el stock disponible (${item.product.stock})`
          }
        }
      })
    }

    return result
  }

  // Calcular stock máximo disponible para un item (considerando modo edición)
  const getMaxStockForItem = (item: SaleItemRow & { id: string }): number | undefined => {
    if (!item.product) {
      return undefined
    }

    if (isEditMode && initialSale) {
      // En modo edición, verificar si este producto ya estaba en la venta original
      const originalItem = initialSale.items.find(orig => orig.productId === item.productId)
      
      if (originalItem) {
        // Producto existente: stock disponible = stock actual + cantidad original (que se restaurará)
        return item.product.stock + originalItem.cantidad
      } else {
        // Producto nuevo: usar stock actual
        return item.product.stock
      }
    } else {
      // Modo creación: usar stock actual
      return item.product.stock
    }
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

  // Guardar borrador si hay datos válidos
  const saveCurrentDraft = (): boolean => {
    const validItems = saleItems.filter(item => item.product && item.quantity > 0)
    if (validItems.length === 0) {
      return false
    }

    const draftItems = validItems.map(item => ({
      productId: item.product!.id,
      productNombre: item.product!.nombre,
      quantity: item.quantity,
      precioUnitario: esMayorista 
        ? getFinancials(item.product!).precioVentaMayorista 
        : getFinancials(item.product!).precioVenta
    }))

    const draft: SaleDraft = {
      id: draftIdRef.current || generateDraftId(),
      fecha: new Date().toISOString(),
      saleData: {
        items: draftItems,
        esMayorista,
        total: calculateTotal()
      }
    }

    saveDraft(draft)
    draftIdRef.current = draft.id
    if (onDraftSaved) {
      onDraftSaved()
    }
    return true
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

      // Si había un borrador, eliminarlo
      if (draftIdRef.current && onDraftDeleted) {
        onDraftDeleted()
      }

      // Resetear y cerrar
      setSaleItems([createEmptyItem()])
      setErrors({})
      draftIdRef.current = null
      onClose()
    } catch (error: any) {
      // Si falla, guardar como borrador
      const saved = saveCurrentDraft()
      if (saved) {
        setErrors({ general: `${error.message || 'Error al crear la venta'}. La venta se guardó como borrador.` })
      } else {
        setErrors({ general: error.message || 'Error al crear la venta' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar si hay datos válidos para guardar
  const hasValidDataToSave = () => {
    return saleItems.some(item => item.product && item.quantity > 0)
  }

  // Manejar cierre con X (guardar borrador)
  const handleCloseX = () => {
    if (hasValidDataToSave()) {
      // Mostrar diálogo de confirmación
      setShowExitConfirmDialog(true)
    } else {
      // Si no hay datos válidos, cerrar directamente
      onClose()
    }
  }

  // Confirmar salir y guardar borrador
  const handleConfirmExit = () => {
    saveCurrentDraft()
    onClose()
    setShowExitConfirmDialog(false)
  }

  // Manejar cancelar (no guardar borrador)
  const handleCancel = () => {
    if (hasValidDataToSave()) {
      // Mostrar diálogo de confirmación
      setShowCancelConfirmDialog(true)
    } else {
      // Si no hay datos válidos, cerrar directamente
      onClose()
    }
  }

  // Confirmar cancelar y perder datos
  const handleConfirmCancel = () => {
    onClose()
    setShowCancelConfirmDialog(false)
  }

  const total = calculateTotal()
  const hasValidItems = saleItems.some(item => item.product && item.quantity > 0)
  const hasItemErrors = Object.keys(errors).some(key => key !== 'general')

  return (
      <Modal
        isOpen={isOpen}
        onClose={handleCloseX}
        title={isEditMode 
          ? (esMayorista ? "Editar Venta Mayorista" : "Editar Venta")
          : (draft ? "Continuar Borrador" : (esMayorista ? "Nueva Venta Mayorista" : "Nueva Venta"))
        }
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
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Venta Mayorista
            </span>
            {esMayorista && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
                MAYORISTA
              </span>
            )}
          </div>
          <label htmlFor="esMayorista" className="relative inline-flex items-center cursor-pointer">
            <span className="sr-only">Toggle venta mayorista</span>
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
                ref={(el) => {
                  if (el) {
                    itemRefs.current.set(item.id, el)
                  } else {
                    itemRefs.current.delete(item.id)
                  }
                }}
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

              <Autocomplete
                label="Producto"
                value={item.productId}
                onChange={(value) => updateItem(index, 'productId', value)}
                options={[
                  { value: '', label: 'Seleccionar producto' },
                  ...productOptions
                ]}
                error={lowerItemError?.includes('producto') ? itemError : undefined}
                required
                placeholder="Buscar producto..."
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
                max={getMaxStockForItem(item)}
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
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!hasValidItems || total === 0 || hasItemErrors}
          >
            {isEditMode 
              ? (esMayorista ? 'Guardar Cambios (Mayorista)' : 'Guardar Cambios')
              : (esMayorista ? 'Confirmar Venta Mayorista' : 'Confirmar Venta')
            }
          </Button>
        </div>
      </form>

      {/* Diálogo de confirmación para salir y guardar borrador */}
      <ConfirmDialog
        isOpen={showExitConfirmDialog}
        onClose={() => setShowExitConfirmDialog(false)}
        onConfirm={handleConfirmExit}
        title="¿Salir y guardar como borrador?"
        message="Si sales ahora, la venta se guardará como borrador y podrás continuarla más tarde. ¿Deseas salir?"
        confirmText="Sí, salir"
        cancelText="Quedarse"
        variant="warning"
      />

      {/* Diálogo de confirmación para cancelar */}
      <ConfirmDialog
        isOpen={showCancelConfirmDialog}
        onClose={() => setShowCancelConfirmDialog(false)}
        onConfirm={handleConfirmCancel}
        title="¿Cancelar la carga de venta?"
        message="Si cancelas, todos los datos ingresados se perderán y no se guardará ningún borrador. ¿Estás seguro?"
        confirmText="Sí, cancelar"
        cancelText="Continuar"
        variant="danger"
      />
    </Modal>
  )
}

