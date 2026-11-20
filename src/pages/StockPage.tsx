import React, { useMemo, useState } from 'react'
import type { CreateMovimientoRequest } from '@/types/stock'
import { TIPO_MOVIMIENTO_LABEL } from '@/types/stock'
import {
  useStockResumen,
  useSaldos,
  useMovimientos,
  useCreateMovimiento
} from '../hooks/useStock'
import { useSectores } from '../hooks/useSectores'
import { useProducts } from '../hooks/useProducts'
import { useToast } from '../providers/ToastProvider'
import { MovimientoFormModal } from '../components/stock/MovimientoFormModal'
import { Table, TableHeader, TableHead, TableRow } from '../components/ui/Table'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { formatDate } from '../shared/functions'

type Vista = 'saldos' | 'movimientos'

const VARIANTE_POR_TIPO = {
  entrada: 'success',
  salida: 'danger',
  transferencia: 'info',
  ajuste: 'warning'
} as const

/**
 * Pantalla de stock.
 *
 * "Saldos" es la vista de control: por cada producto, el total del
 * emprendimiento y cómo se reparte entre los sectores, incluidos los que
 * están en cero. "Movimientos" es el libro que explica cada cambio.
 * Autor: Equipo Sorbo Sabores
 */
export const StockPage: React.FC = () => {
  const { data: resumen = [], isLoading: isLoadingResumen } = useStockResumen()
  const { data: saldos = [] } = useSaldos()
  const { data: sectores = [] } = useSectores()
  const { data: productos = [] } = useProducts()
  const { data: movimientos = [], isLoading: isLoadingMovimientos } = useMovimientos()
  const createMovimientoMutation = useCreateMovimiento()
  const toast = useToast()

  const [vista, setVista] = useState<Vista>('saldos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Los sectores que muestran las columnas salen del resumen, no del listado
  // de sectores: así el encabezado y las celdas no se pueden desalinear.
  const columnas = useMemo(() => {
    const primera = resumen[0]
    if (!primera) return []
    return primera.porSector.map(s => ({
      sectorId: s.sectorId,
      sectorNombre: s.sectorNombre
    }))
  }, [resumen])

  const saldoPorClave = useMemo(() => {
    const acc = new Map<string, number>()
    saldos.forEach(saldo => {
      acc.set(`${saldo.productId}|${saldo.sectorId}`, saldo.cantidad)
    })
    return acc
  }, [saldos])

  const saldoDe = (productId: string, sectorId: string) =>
    saldoPorClave.get(`${productId}|${sectorId}`) ?? 0

  const resumenFiltrado = useMemo(() => {
    if (!searchQuery.trim()) return resumen
    const query = searchQuery.toLowerCase()
    return resumen.filter(fila => fila.productNombre.toLowerCase().includes(query))
  }, [resumen, searchQuery])

  const totalUnidades = useMemo(
    () => resumen.reduce((acc, fila) => acc + fila.total, 0),
    [resumen]
  )

  const handleSubmit = async (payload: CreateMovimientoRequest) => {
    try {
      await createMovimientoMutation.mutateAsync(payload)
      toast.success('Movimiento registrado correctamente')
      setIsModalOpen(false)
    } catch (error: any) {
      console.error('Error registrando movimiento:', error)
      toast.error(
        error?.response?.data?.message || 'No se pudo registrar el movimiento'
      )
    }
  }

  const isLoading = vista === 'saldos' ? isLoadingResumen : isLoadingMovimientos

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Stock
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {totalUnidades} unidad(es) en total, repartidas entre {columnas.length}{' '}
            sector(es).
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          disabled={sectores.length === 0 || productos.length === 0}
        >
          Registrar Movimiento
        </Button>
      </div>

      {sectores.length === 0 && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200">
          Todavía no hay sectores. Creá al menos uno en la pantalla de Sectores
          antes de cargar stock.
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['saldos', 'movimientos'] as Vista[]).map(opcion => (
          <button
            key={opcion}
            onClick={() => setVista(opcion)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              vista === opcion
                ? 'border-primary-600 text-primary-700 dark:text-primary-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            {opcion === 'saldos' ? 'Saldos' : 'Movimientos'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        </div>
      ) : vista === 'saldos' ? (
        <div className="space-y-4">
          <Input
            placeholder="Buscar producto..."
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
          />

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableHead>Producto</TableHead>
                  {columnas.map(columna => (
                    <TableHead key={columna.sectorId} align="right">
                      {columna.sectorNombre}
                    </TableHead>
                  ))}
                  <TableHead align="right">Total</TableHead>
                </TableHeader>
                <tbody>
                  {resumenFiltrado.length === 0 ? (
                    <TableRow>
                      <td
                        colSpan={columnas.length + 2}
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        {searchQuery.trim()
                          ? `No se encontró producto con nombre '${searchQuery}'`
                          : 'No hay productos cargados'}
                      </td>
                    </TableRow>
                  ) : (
                    resumenFiltrado.map(fila => (
                      <TableRow key={fila.productId}>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                          {fila.productNombre}
                        </td>
                        {fila.porSector.map(celda => (
                          <td
                            key={celda.sectorId}
                            className={`px-4 py-3 text-right ${
                              celda.cantidad === 0
                                ? 'text-gray-400 dark:text-gray-600'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            {celda.cantidad}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                          {fila.total}
                        </td>
                      </TableRow>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead align="right">Cantidad</TableHead>
                <TableHead>Motivo</TableHead>
              </TableHeader>
              <tbody>
                {movimientos.length === 0 ? (
                  <TableRow>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      Todavía no hay movimientos registrados.
                    </td>
                  </TableRow>
                ) : (
                  movimientos.map(movimiento => (
                    <TableRow key={movimiento.id}>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                        {formatDate(movimiento.fecha)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={VARIANTE_POR_TIPO[movimiento.tipo]}>
                          {TIPO_MOVIMIENTO_LABEL[movimiento.tipo]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                        {movimiento.productNombre}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {movimiento.sectorOrigenNombre || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {movimiento.sectorDestinoNombre || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                        {movimiento.cantidad}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {movimiento.motivo || '—'}
                      </td>
                    </TableRow>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>
      )}

      <MovimientoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        productos={productos}
        sectores={sectores}
        saldoDe={saldoDe}
      />
    </div>
  )
}
