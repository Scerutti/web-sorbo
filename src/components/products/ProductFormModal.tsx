import React, { useState, useEffect, useMemo } from 'react'
import { CostItem, Product, TipoCosto } from '../../shared/types'
import type { CreateProductRequest } from '@/types/product'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { calculateApplicableCosts, calculateProductSalePrice } from '../../shared/functions'
import { useAuth } from '../../providers/AuthProvider'
import { useToast } from '../../providers/ToastProvider'
import { useSectores } from '../../hooks/useSectores'
import { useSaldos, useFijarSaldos } from '../../hooks/useStock'
import type { FijarSaldosRequest, StockSector } from '@/types/stock'
import type { Sector } from '@/types/sector'

// Valor por defecto estable para las consultas sin datos. Un `= []` en el
// destructuring crea un arreglo nuevo en cada render; si ese arreglo es
// dependencia de un efecto que hace setState, el componente entra en un
// bucle infinito mientras la consulta carga o falla.
const SIN_SECTORES: Sector[] = []
const SIN_SALDOS: StockSector[] = []

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  /**
   * Guarda el producto. Devuelve el producto guardado, o undefined si falló
   * (el padre ya avisó). Con el id se carga después el stock por sector.
   */
  onSubmit: (product: CreateProductRequest) => Promise<Product | undefined>
  initialProduct?: Product | null
  /**
   * TODOS los tipos de costo. Los globales (aplicaATodos) no son elegibles
   * en el desplegable, pero hacen falta para calcular el preview.
   */
  tiposCosto: TipoCosto[]
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
  tiposCosto,
  costItems
}) => {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipoId, setTipoId] = useState('')
  const [precioCosto, setPrecioCosto] = useState('')
  const [porcentajeGanancia, setPorcentajeGanancia] = useState('50')
  const [porcentajeGananciaMayorista, setPorcentajeGananciaMayorista] = useState('0')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // ---- Stock por sector -------------------------------------------------
  // El stock no es un campo del producto: es la suma de los saldos de cada
  // sector, y un producto puede tener unidades en varios a la vez (stock
  // compartido). Acá se elige cuánto queda en cada uno; al guardar, cada
  // cambio se registra como un movimiento, así el libro explica el saldo.
  // Mover stock es solo admin en el backend, así que solo lo ve un admin.
  const { user } = useAuth()
  const toast = useToast()
  const esAdmin = !!user?.roles?.includes('admin')
  const productId = initialProduct?.id
  const { data: sectores = SIN_SECTORES } = useSectores()
  const { data: saldos = SIN_SALDOS } = useSaldos(productId ? { productId } : {})
  const fijarSaldosMutation = useFijarSaldos()
  const [stockPorSector, setStockPorSector] = useState<Record<string, string>>({})

  // Saldo actual por sector de este producto. En un alta no hay ninguno.
  const saldoActual = useMemo(() => {
    const acc = new Map<string, number>()
    if (!productId) return acc
    saldos
      .filter(saldo => saldo.productId === productId)
      .forEach(saldo => acc.set(saldo.sectorId, saldo.cantidad))
    return acc
  }, [saldos, productId])

  // Activos, más los inactivos que todavía tienen unidades (se pueden bajar).
  const sectoresEditables = useMemo(
    () => sectores.filter(s => s.activo || (saldoActual.get(s.id) ?? 0) > 0),
    [sectores, saldoActual]
  )

  useEffect(() => {
    if (!isOpen) return
    const inicial: Record<string, string> = {}
    sectoresEditables.forEach(s => {
      inicial[s.id] = String(saldoActual.get(s.id) ?? 0)
    })
    setStockPorSector(inicial)
  }, [isOpen, sectoresEditables, saldoActual])

  const totalStock = sectoresEditables.reduce(
    (acc, s) => acc + (parseInt(stockPorSector[s.id] ?? '0', 10) || 0),
    0
  )

  useEffect(() => {
    if (initialProduct) {
      setNombre(initialProduct.nombre)
      setDescripcion(initialProduct.descripcion ?? '')
      setTipoId(initialProduct.tipoId)
      setPrecioCosto(initialProduct.precioCosto.toString())
      setPorcentajeGanancia(initialProduct.porcentajeGanancia.toString())
      setPorcentajeGananciaMayorista((initialProduct.porcentajeGananciaMayorista || 0).toString())
    } else {
      resetForm()
    }
  }, [initialProduct, isOpen])

  const resetForm = () => {
    setNombre('')
    setDescripcion('')
    setTipoId('')
    setPrecioCosto('')
    setPorcentajeGanancia('50')
    setPorcentajeGananciaMayorista('0')
    setErrors({})
  }

  /**
   * Saldo final de cada sector que cambió. El backend decide qué parte es
   * transferencia entre sectores, qué parte entrada y qué parte ajuste, y lo
   * registra todo en un solo request (PUT /stock/saldos).
   */
  const saldosAFijar = (): FijarSaldosRequest['saldos'] =>
    sectoresEditables
      .map(sector => ({
        sectorId: sector.id,
        actual: saldoActual.get(sector.id) ?? 0,
        cantidad: parseInt(stockPorSector[sector.id] ?? '', 10)
      }))
      .filter(c => !Number.isNaN(c.cantidad) && c.cantidad !== c.actual)
      .map(({ sectorId, cantidad }) => ({ sectorId, cantidad }))

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!tipoId) {
      newErrors.tipoId = 'El tipo es requerido'
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

    if (esAdmin) {
      sectoresEditables.forEach(sector => {
        const valor = stockPorSector[sector.id] ?? ''
        const numero = Number(valor)
        if (valor === '' || !Number.isInteger(numero) || numero < 0) {
          newErrors[`stock-${sector.id}`] = 'Ingresá un entero mayor o igual a 0'
        } else if (!sector.activo && numero > (saldoActual.get(sector.id) ?? 0)) {
          newErrors[`stock-${sector.id}`] = 'Sector inactivo: sólo se puede bajar'
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Preview en vivo: replica la regla del backend para mostrar el precio
  // antes de guardar. Una vez guardado, el valor autoritativo es el que
  // devuelve la API en `producto.costos`.
  const costosAplicados = useMemo(() => {
    if (!tipoId) return 0
    return calculateApplicableCosts(costItems, tiposCosto, tipoId)
  }, [costItems, tiposCosto, tipoId])

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

  /** Campos del producto tal como se mandan al backend. */
  const datosProducto = (): CreateProductRequest => ({
    nombre: nombre.trim(),
    descripcion: descripcion.trim() || undefined,
    tipoId,
    precioCosto: parseFloat(precioCosto),
    porcentajeGanancia: parseFloat(porcentajeGanancia),
    porcentajeGananciaMayorista: parseFloat(porcentajeGananciaMayorista) || 0
  })

  /**
   * Si al editar sólo se tocó el stock, el producto no se vuelve a guardar:
   * ese PUT era un request entero (con su recálculo de precios) que no
   * cambiaba nada.
   */
  const productoCambio = (datos: CreateProductRequest): boolean => {
    if (!initialProduct) return true
    return (
      datos.nombre !== initialProduct.nombre ||
      (datos.descripcion ?? '') !== (initialProduct.descripcion ?? '') ||
      datos.tipoId !== initialProduct.tipoId ||
      datos.precioCosto !== initialProduct.precioCosto ||
      datos.porcentajeGanancia !== initialProduct.porcentajeGanancia ||
      datos.porcentajeGananciaMayorista !== (initialProduct.porcentajeGananciaMayorista || 0)
    )
  }

  /** Guarda el reparto. Avisa el error y no lo propaga: el producto ya está. */
  const guardarStock = async (productId: string, saldos: FijarSaldosRequest['saldos']) => {
    try {
      await fijarSaldosMutation.mutateAsync({ productId, saldos })
      toast.success('Stock por sector actualizado')
    } catch (error: any) {
      toast.error(
        `No se pudo actualizar el stock: ${error?.response?.data?.message || 'error desconocido'}`
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const datos = datosProducto()
    const guardarProducto = productoCambio(datos)
    // Mover stock es solo admin en el backend.
    const saldos = esAdmin ? saldosAFijar() : []

    if (!guardarProducto && saldos.length === 0) {
      handleClose()
      return
    }

    setIsLoading(true)
    try {
      if (initialProduct) {
        // Editando, el id ya se conoce: producto y stock van a la vez.
        const [guardado] = await Promise.all([
          guardarProducto ? onSubmit(datos) : Promise.resolve(initialProduct),
          saldos.length > 0 ? guardarStock(initialProduct.id, saldos) : Promise.resolve()
        ])
        // El padre ya avisó el error: se queda abierto para corregir.
        if (!guardado) return
      } else {
        // En un alta el stock necesita el id del producto nuevo.
        const guardado = await onSubmit(datos)
        if (!guardado) return
        if (saldos.length > 0) await guardarStock(guardado.id, saldos)
      }

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

  // Elegibles: solo los tipos asignables. Los globales aplican solos.
  const typeOptions = tiposCosto
    .filter(tipo => !tipo.aplicaATodos)
    .map(tipo => ({
      value: tipo.id,
      label: tipo.nombre
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

        <Input
          label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          aria-label="Descripción del producto"
        />

        <Select
          label="Tipo"
          value={tipoId}
          onChange={(e) => setTipoId(e.target.value)}
          options={typeOptions}
          error={errors.tipoId}
          placeholder="Seleccionar tipo"
          helperText={
            typeOptions.length === 0
              ? 'No hay tipos asignables. Creá uno en "Tipos de Costo".'
              : undefined
          }
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

        {esAdmin && (
          <fieldset className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <legend className="px-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Stock por sector
            </legend>
            {sectoresEditables.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No hay sectores activos. Creá uno en "Sectores y usuarios" para cargar stock.
              </p>
            ) : (
              <>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Las unidades que hay en cada sector. Puede estar repartido en
                  varios. Cada cambio queda registrado como un movimiento.
                </p>
                {/* Una fila por sector: escala a muchos sectores sin que el
                    modal crezca sin límite. Pasado cierto alto, la lista
                    scrollea adentro y el total queda siempre a la vista. */}
                <ul className="max-h-64 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700 rounded-md border border-gray-200 dark:border-gray-700">
                  {sectoresEditables.map(sector => {
                    const actual = saldoActual.get(sector.id) ?? 0
                    const valor = stockPorSector[sector.id] ?? ''
                    const cambio = valor !== '' && Number(valor) !== actual
                    const error = errors[`stock-${sector.id}`]
                    const inputId = `stock-${sector.id}`
                    return (
                      <li key={sector.id} className="px-3 py-2">
                        <div className="flex items-center justify-between gap-3">
                          <label
                            htmlFor={inputId}
                            className="min-w-0 flex-1 truncate text-sm text-gray-800 dark:text-gray-200"
                            title={sector.nombre}
                          >
                            {sector.nombre}
                            {!sector.activo && (
                              <span className="ml-1 text-xs text-gray-500">(inactivo)</span>
                            )}
                          </label>
                          {cambio && (
                            <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                              antes {actual}
                            </span>
                          )}
                          <input
                            id={inputId}
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            value={valor}
                            onChange={(e) =>
                              setStockPorSector(prev => ({ ...prev, [sector.id]: e.target.value }))
                            }
                            aria-label={`Stock en ${sector.nombre}`}
                            aria-invalid={!!error}
                            className={`w-24 shrink-0 rounded-md border px-2 py-1 text-right text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                              error
                                ? 'border-red-500'
                                : cambio
                                  ? 'border-primary-500'
                                  : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                        </div>
                        {error && (
                          <p className="mt-1 text-right text-xs text-red-600 dark:text-red-400" role="alert">
                            {error}
                          </p>
                        )}
                      </li>
                    )
                  })}
                </ul>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{totalStock}</span>
                </div>
              </>
            )}
          </fieldset>
        )}

        {tipoId && (
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

