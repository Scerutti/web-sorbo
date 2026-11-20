import React, { useEffect, useState } from 'react'
import type { User, CreateUserRequest, UserRole } from '@/types/user'
import { USER_ROLES, USER_ROLE_LABEL } from '../../shared/constants'
import type { Sector } from '@/types/sector'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'

/**
 * Modal para crear/editar usuarios.
 *
 * El sector es lo que decide de qué stock descuentan sus ventas. Un vendedor
 * sin sector no puede vender ni ver saldos, así que conviene asignarlo acá.
 * Autor: Equipo Sorbo Sabores
 */
interface UsuarioFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (usuario: CreateUserRequest) => Promise<void>
  initialUsuario?: User | null
  sectores: Sector[]
}

const LARGO_MINIMO_PASSWORD = 12

export const UsuarioFormModal: React.FC<UsuarioFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialUsuario,
  sectores
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [roles, setRoles] = useState<UserRole[]>(['seller'])
  const [sectorId, setSectorId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdicion = !!initialUsuario

  useEffect(() => {
    if (initialUsuario) {
      setEmail(initialUsuario.email)
      setPassword('')
      setDisplayName(initialUsuario.name || '')
      setRoles(initialUsuario.roles?.length ? initialUsuario.roles : ['seller'])
      setSectorId(initialUsuario.sectorId || '')
      setErrors({})
    } else {
      resetForm()
    }
  }, [initialUsuario, isOpen])

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setDisplayName('')
    setRoles(['seller'])
    setSectorId('')
    setErrors({})
  }

  const toggleRole = (role: UserRole) => {
    setRoles(actuales =>
      actuales.includes(role)
        ? actuales.filter(r => r !== role)
        : [...actuales, role]
    )
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      newErrors.email = 'Ingresá un email válido'
    }

    // En edición la contraseña vacía significa "no la cambies".
    if (!isEdicion || password.length > 0) {
      if (password.length < LARGO_MINIMO_PASSWORD) {
        newErrors.password = `La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres`
      }
    }

    if (roles.length === 0) {
      newErrors.roles = 'Elegí al menos un rol'
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
        email: email.trim().toLowerCase(),
        ...(password ? { password } : ({} as { password: string })),
        ...(displayName.trim() ? { displayName: displayName.trim() } : {}),
        roles,
        ...(sectorId ? { sectorId } : {})
      } as CreateUserRequest)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdicion ? 'Editar usuario' : 'Nuevo usuario'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          error={errors.email}
          autoFocus
        />

        <Input
          label={isEdicion ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          type="password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          error={errors.password}
          helperText={
            isEdicion
              ? 'Dejala vacía para no cambiarla.'
              : `Mínimo ${LARGO_MINIMO_PASSWORD} caracteres.`
          }
        />

        <Input
          label="Nombre (opcional)"
          value={displayName}
          onChange={event => setDisplayName(event.target.value)}
        />

        <div>
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Roles
          </span>
          <div className="flex gap-4">
            {USER_ROLES.map(role => (
              <label key={role} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={() => toggleRole(role)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {USER_ROLE_LABEL[role]}
                </span>
              </label>
            ))}
          </div>
          {errors.roles && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.roles}</p>
          )}
        </div>

        <Select
          label="Sector"
          value={sectorId}
          onChange={event => setSectorId(event.target.value)}
          options={sectores
            .filter(sector => sector.activo || sector.id === sectorId)
            .map(sector => ({ value: sector.id, label: sector.nombre }))}
          placeholder="Sin sector asignado"
          helperText="Sus ventas descuentan del stock de este sector. Un vendedor sin sector no puede vender."
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isEdicion ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
