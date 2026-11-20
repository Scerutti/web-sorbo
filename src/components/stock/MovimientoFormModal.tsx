import React, { useEffect, useMemo, useState } from 'react'
import type { Product } from '@/types/product'
import type { Sector } from '@/types/sector'
import type { CreateMovimientoRequest, TipoMovimiento } from '@/types/stock'
import { TIPO_MOVIMIENTO_LABEL } from '@/types/stock'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'

/**
 * Modal para registrar un movimiento de stock.
 *
 * Los campos cambian según el tipo: una entrada sólo necesita destino, una
 * salida sólo origen, y una transferencia los dos. El ajuste pide el saldo
 * final que debe quedar, no el delta — el backend calcula la diferencia.
 * Autor: Equipo Sorbo Sabores
 */
interface MovimientoFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (movimiento: CreateMovimientoRequest) => Promise<void>
  productos: Product[]
  sectores: Sector[]
  /** Saldo actual por sector del producto elegido, para mostrarlo de guía. */
  saldoDe: (productId: string, sectorId: string) => number
}

const AYUDA_POR_TIPO: Record<TipoMovimiento, string> = {
  entrada: 'Compra de insumos: las unidades entran al sector que elijas.',
  salida: 'Rotura, consumo o cualquier baja que no sea una venta.',
  transferencia: 'Mueve unidades de un sector a otro.',
  ajuste: 'Conteo físico: dejá el saldo en el número que contaste.'
}

export const MovimientoFormModal: React.FC<MovimientoFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  productos,
  sectores,
  saldoDe
}) => {
  const [tipo, setTipo] = useState<TipoMovimiento>('entrada')
  const [productId, setProductId] = useState('')
  const [sectorOrigenId, setSectorOrigenId] = useState('')
  const [sectorDestinoId, setSectorDestinoId] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) resetForm()
  }, [isOpen])

  const resetForm = () => {
    setTipo('entrada')
    setProductId('')
    setSectorOrigenId('')
    setSectorDestinoId('')
    setCantidad('')
    setMotivo('')
    setErrors({})
  }

  const usaOrigen = tipo === 'salida' || tipo === 'transferencia'
  const usaDestino = tipo === 'entrada' || tipo === 'transferencia' || tipo === 'ajuste'

  // Un sector inactivo puede vaciarse pero no recibir.
  const opcionesOrigen = useMemo(
    () => sectores.map(s => ({ value: s.id, label: s.nombre })),
    [sectores]
  )
  const opcionesDestino = useMemo(
    () =>
      sectores
        .filter(s => s.activo)
        .map(s => ({ value: s.id, label: s.nombre })),
    [sectores]
  )

  const saldoOrigen =
    productId && sectorOrigenId ? saldoDe(productId, sectorOrigenId) : null
  const saldoDestino =
    productId && sectorDestinoId ? saldoDe(productId, sectorDestinoId) : null

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!productId) newErrors.productId = 'Elegí un producto'
    if (usaOrigen && !sectorOrigenId) newErrors.sectorOrigenId = 'Elegí el sector de origen'
    if (usaDestino && !sectorDestinoId) {
      newErrors.sectorDestinoId =
        tipo === 'ajuste' ? 'Elegí el sector a ajustar' : 'Elegí el sector de destino'
    }

    if (
      tipo === 'transferencia' &&
      sectorOrigenId &&
      sectorOrigenId === sectorDestinoId
    ) {
      newErrors.sectorDestinoId = 'El origen y el destino no pueden ser el mismo'
    }

    const numero = Number(cantidad)
    const minimo = tipo === 'ajuste' ? 0 : 1
    if (cantidad === '' || Number.isNaN(numero) || !Number.isInteger(numero)) {
      newErrors.cantidad = 'Ingresá un número entero'
    } else if (numero < minimo) {
      newErrors.cantidad =
        tipo === 'ajuste'
          ? 'El saldo final no puede ser negativo'
          : 'La cantidad debe ser al menos 1'
    } else if (tipo === 'ajuste' && saldoDestino !== null && numero === saldoDestino) {
      newErrors.cantidad = `El saldo ya es ${numero}. No hay nada que ajustar.`
    } else if (usaOrigen && saldoOrigen !== null && numero > saldoOrigen) {
      newErrors.cantidad = `El sector de origen tiene ${saldoOrigen} unidad(es)`
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
        tipo,
        productId,
        ...(usaOrigen ? { sectorOrigenId } : {}),
        ...(usaDestino ? { sectorDestinoId } : {}),
        cantidad: Number(cantidad),
        ...(motivo.trim() ? { motivo: motivo.trim() } : {})
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar movimiento de stock">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Tipo"
          value={tipo}
          onChange={event => setTipo(event.target.value as TipoMovimiento)}
          options={(Object.keys(TIPO_MOVIMIENTO_LABEL) as TipoMovimiento[]).map(t => ({
            value: t,
            label: TIPO_MOVIMIENTO_LABEL[t]
          }))}
          helperText={AYUDA_POR_TIPO[tipo]}
        />

        <Select
          label="Producto"
          value={productId}
          onChange={event => setProductId(event.target.value)}
          options={productos.map(p => ({ value: p.id, label: p.nombre }))}
          placeholder="Elegí un producto"
          error={errors.productId}
        />

        {usaOrigen && (
          <Select
            label="Sector de origen"
            value={sectorOrigenId}
            onChange={event => setSectorOrigenId(event.target.value)}
            options={opcionesOrigen}
            placeholder="Elegí el sector"
            error={errors.sectorOrigenId}
            helperText={
              saldoOrigen !== null ? `Saldo actual: ${saldoOrigen}` : undefined
            }
          />
        )}

        {usaDestino && (
          <Select
            label={tipo === 'ajuste' ? 'Sector a ajustar' : 'Sector de destino'}
            value={sectorDestinoId}
            onChange={event => setSectorDestinoId(event.target.value)}
            options={opcionesDestino}
            placeholder="Elegí el sector"
            error={errors.sectorDestinoId}
            helperText={
              saldoDestino !== null ? `Saldo actual: ${saldoDestino}` : undefined
            }
          />
        )}

        <Input
          label={tipo === 'ajuste' ? 'Saldo final' : 'Cantidad'}
          type="number"
          min={tipo === 'ajuste' ? 0 : 1}
          step={1}
          value={cantidad}
          onChange={event => setCantidad(event.target.value)}
          error={errors.cantidad}
          helperText={
            tipo === 'ajuste'
              ? 'El número que contaste. El sistema calcula la diferencia.'
              : undefined
          }
        />

        <Input
          label="Motivo (opcional)"
          value={motivo}
          onChange={event => setMotivo(event.target.value)}
          placeholder="Compra a proveedor, conteo de fin de mes, rotura..."
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            Registrar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
