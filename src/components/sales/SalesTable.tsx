import React, { useState } from 'react'
import { Sale } from '../../shared/types'
import { formatDate, formatCurrency } from '../../shared/functions'
import { Table, TableHeader, TableHead, TableRow, TableCell } from '../ui/Table'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'

interface SalesTableProps {
  sales: Sale[]
}

/**
 * Tabla de ventas con expansión de items - 100% responsive
 * Desktop: tabla horizontal
 * Mobile: cards verticales
 */
export const SalesTable: React.FC<SalesTableProps> = ({ sales }) => {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const openModal = (sale: Sale) => setSelectedSale(sale)
  const closeModal = () => setSelectedSale(null)
  const selectedSaleIndex = selectedSale ? sales.findIndex(current => current.id === selectedSale.id) + 1 : null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableHead>Número</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead align="right">Total Venta</TableHead>
            <TableHead>Detalle</TableHead>
          </TableHeader>
          <tbody>
            {sales.map((sale, index) => {
              return (
                <TableRow key={sale.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{formatDate(sale.fecha)}</TableCell>
                  <TableCell>
                    <Badge variant={sale.esMayorista ? "warning" : "success"}>
                      {sale.esMayorista ? "Mayorista" : "Normal"}
                    </Badge>
                  </TableCell>
                  <TableCell align="right">{formatCurrency(sale.total)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Badge variant="info">{sale.items.length} items</Badge>
                      <button
                        onClick={() => openModal(sale)}
                        className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
                        aria-label={`Ver detalle de la venta ${index + 1}`}
                      >
                        Ver detalle
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </tbody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {sales.map((sale, index) => {
          return (
            <div
              key={sale.id}
              className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Venta #{index + 1}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div>Fecha: {formatDate(sale.fecha)}</div>
                      <div>
                        Tipo: <Badge variant={sale.esMayorista ? "warning" : "success"}>{sale.esMayorista ? "Mayorista" : "Normal"}</Badge>
                      </div>
                    </div>
                  </div>
                  <Badge variant="info">{sale.items.length} items</Badge>
                </div>
                <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(sale.total)}
                </div>
                <button
                  onClick={() => openModal(sale)}
                  className="w-full text-primary-600 dark:text-primary-300 font-medium text-sm hover:underline"
                  aria-label={`Ver detalle de la venta ${index + 1}`}
                >
                  Ver detalle
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal
        isOpen={!!selectedSale}
        onClose={closeModal}
        title={
          selectedSaleIndex && selectedSaleIndex > 0
            ? `Detalle Venta #${selectedSaleIndex}`
            : 'Detalle de Venta'
        }
        size="lg"
      >
        {selectedSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400 block">Fecha</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatDate(selectedSale.fecha)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400 block">Tipo</span>
                <span className="inline-block mt-1">
                  <Badge variant={selectedSale.esMayorista ? "warning" : "success"}>
                    {selectedSale.esMayorista ? "Mayorista" : "Normal"}
                  </Badge>
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400 block">Total</span>
                <span className="font-semibold text-primary-600 dark:text-primary-300">
                  {formatCurrency(selectedSale.total)}
                </span>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
              {selectedSale.items.map(item => (
                <div
                  key={`${item.productId}-${item.cantidad}-${item.precioUnitario}`}
                  className="p-4 space-y-3 bg-white dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.productNombre}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.cantidad} unidades
                      </p>
                    </div>
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-300">
                      {formatCurrency(item.precioUnitario * item.cantidad)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      Costo base:{' '}
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.snapshot.precioCosto)}
                      </span>
                    </span>
                    <span>
                      Costos aplicados:{' '}
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.snapshot.costos)}
                      </span>
                    </span>
                    <span>
                      Margen:{' '}
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {item.snapshot.porcentajeGanancia}%
                      </span>
                    </span>
                    {item.snapshot.porcentajeGananciaMayorista !== undefined && (
                      <span>
                        Margen Mayorista:{' '}
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {item.snapshot.porcentajeGananciaMayorista}%
                        </span>
                      </span>
                    )}
                    <span>
                      Precio unitario:{' '}
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.snapshot.precioVenta)}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

