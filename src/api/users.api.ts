import { axiosPrivate } from './http'
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types/user'

/**
 * Obtiene todos los usuarios
 */
export const getUsers = async (): Promise<User[]> => {
  const { data } = await axiosPrivate.get<User[]>('/users')
  return data
}

/**
 * Obtiene un usuario por ID
 */
export const getUserById = async (id: string): Promise<User> => {
  const { data } = await axiosPrivate.get<User>(`/users/${id}`)
  return data
}

/**
 * Crea un nuevo usuario
 */
export const createUser = async (user: CreateUserRequest): Promise<User> => {
  const { data } = await axiosPrivate.post<User>('/users', user)
  return data
}

/**
 * Actualiza un usuario existente
 */
export const updateUser = async (id: string, user: UpdateUserRequest): Promise<User> => {
  const { data } = await axiosPrivate.patch<User>(`/users/${id}`, user)
  return data
}

/**
 * Elimina un usuario
 */
export const deleteUser = async (id: string): Promise<void> => {
  await axiosPrivate.delete(`/users/${id}`)
}

