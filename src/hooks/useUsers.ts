import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '@/api/users.api'
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types/user'

/**
 * Hook para obtener todos los usuarios
 */
export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getUsers
  })
}

/**
 * Hook para obtener un usuario por ID
 */
export const useUser = (id: string) => {
  return useQuery<User>({
    queryKey: ['users', id],
    queryFn: () => getUserById(id),
    enabled: !!id
  })
}

/**
 * Hook para crear un usuario
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (user: CreateUserRequest) => createUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

/**
 * Hook para actualizar un usuario
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, user }: { id: string; user: UpdateUserRequest }) => updateUser(id, user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', data.id] })
    }
  })
}

/**
 * Hook para eliminar un usuario
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

