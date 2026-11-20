import React, { useMemo, useState } from 'react'
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types/user'
import { USER_ROLE_LABEL } from '../shared/constants'
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser
} from '../hooks/useUsers'
import { useSectores } from '../hooks/useSectores'
import { useToast } from '../providers/ToastProvider'
import { useConfirm } from '../hooks/useConfirm'
import { useAuth } from '../providers/AuthProvider'
import { UsuarioFormModal } from '../components/usuarios/UsuarioFormModal'
import { Table, TableHeader, TableHead, TableRow } from '../components/ui/Table'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

/**
 * Página para administrar usuarios y, sobre todo, asignarles sector.
 * El sector decide de qué stock descuentan sus ventas y qué saldos pueden ver.
 * Autor: Equipo Sorbo Sabores
 */
export const UsuariosPage: React.FC = () => {
  const { data: usuarios = [], isLoading } = useUsers()
  const { data: sectores = [] } = useSectores()
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()
  const toast = useToast()
  const { confirm, ConfirmDialog } = useConfirm()
  const { user: usuarioActual } = useAuth()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<User | null>(null)

  const nombrePorSector = useMemo(() => {
    const acc = new Map<string, string>()
    sectores.forEach(sector => acc.set(sector.id, sector.nombre))
    return acc
  }, [sectores])

  const sinSector = useMemo(
    () => usuarios.filter(usuario => !usuario.sectorId).length,
    [usuarios]
  )

  const admins = useMemo(
    () => usuarios.filter(usuario => usuario.roles?.includes('admin')).length,
    [usuarios]
  )

  const handleCreate = () => {
    setEditingUsuario(null)
    setIsModalOpen(true)
  }

  const handleEdit = (usuario: User) => {
    setEditingUsuario(usuario)
    setIsModalOpen(true)
  }

  const handleDelete = async (usuario: User) => {
    const confirmed = await confirm({
      title: 'Eliminar usuario',
      message: `¿Estás seguro de eliminar a ${usuario.email}? Esta acción no se puede deshacer.`,
      variant: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    })

    if (!confirmed) return

    try {
      await deleteUserMutation.mutateAsync(usuario.id)
      toast.success('Usuario eliminado correctamente')
    } catch (error: any) {
      console.error('Error eliminando usuario:', error)
      toast.error(error?.response?.data?.message || 'No se pudo eliminar el usuario')
    }
  }

  const handleSubmit = async (payload: CreateUserRequest | UpdateUserRequest) => {
    try {
      if (editingUsuario) {
        await updateUserMutation.mutateAsync({ id: editingUsuario.id, user: payload })
        toast.success('Usuario actualizado correctamente')
      } else {
        await createUserMutation.mutateAsync(payload as CreateUserRequest)
        toast.success('Usuario creado correctamente')
      }
      setIsModalOpen(false)
      setEditingUsuario(null)
    } catch (error: any) {
      console.error('Error guardando usuario:', error)
      toast.error(error?.response?.data?.message || 'No se pudo guardar el usuario')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 id="titulo-usuarios" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Usuarios
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {usuarios.length} usuario(s), {admins} con rol de administrador.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          Nuevo Usuario
        </Button>
      </div>

      {admins === 0 && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
          No hay ningún usuario con rol de administrador. Sin eso, nadie puede
          crear sectores ni mover stock.
        </div>
      )}

      {sinSector > 0 && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200">
          {sinSector} usuario(s) sin sector asignado. Un vendedor sin sector no
          puede registrar ventas ni ver saldos.
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableHead>Usuario</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Acciones</TableHead>
            </TableHeader>
            <tbody>
              {usuarios.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No hay usuarios cargados
                  </td>
                </TableRow>
              ) : (
                usuarios.map(usuario => (
                  <TableRow key={usuario.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {usuario.name || usuario.email}
                      </div>
                      {usuario.name && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {usuario.email}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {usuario.roles?.length ? (
                          usuario.roles.map(role => (
                            <Badge
                              key={role}
                              variant={role === 'admin' ? 'info' : 'default'}
                            >
                              {USER_ROLE_LABEL[role]}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="warning">Sin rol</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {usuario.sectorId ? (
                        <span className="text-gray-900 dark:text-gray-100">
                          {nombrePorSector.get(usuario.sectorId) || 'Sector eliminado'}
                        </span>
                      ) : (
                        <Badge variant="warning">Sin asignar</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(usuario)}
                          aria-label={`Editar ${usuario.email}`}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(usuario)}
                          disabled={usuario.id === usuarioActual?.id}
                          aria-label={`Eliminar ${usuario.email}`}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </TableRow>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>

      <UsuarioFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialUsuario={editingUsuario}
        sectores={sectores}
      />

      {ConfirmDialog}
    </div>
  )
}
