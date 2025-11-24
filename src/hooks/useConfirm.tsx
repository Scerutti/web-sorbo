import { useState, useCallback } from 'react'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

/**
 * Hook para mostrar diálogos de confirmación
 * Reemplazo de window.confirm() pero responsive y accesible
 * 
 * @example
 * const confirm = useConfirm()
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Eliminar producto',
 *     message: '¿Estás seguro de eliminar este producto?',
 *     variant: 'danger'
 *   })
 *   
 *   if (confirmed) {
 *     // Eliminar producto
 *   }
 * }
 */
export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setOptions(opts)
      setIsOpen(true)
      setResolvePromise(() => resolve)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true)
      setResolvePromise(null)
    }
    setIsOpen(false)
  }, [resolvePromise])

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false)
      setResolvePromise(null)
    }
    setIsOpen(false)
  }, [resolvePromise])

  const ConfirmComponent = options ? (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={options.title || 'Confirmar acción'}
      message={options.message}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
    />
  ) : null

  return {
    confirm,
    ConfirmDialog: ConfirmComponent
  }
}

