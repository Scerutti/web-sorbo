export type UserRole = 'admin' | 'seller'

export const USER_ROLES: UserRole[] = ['admin', 'seller']

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrador',
  seller: 'Vendedor'
}

export interface User {
  id: string
  email: string
  name?: string
  roles?: UserRole[]
  /** Sector en el que opera: sus ventas descuentan de ese stock. */
  sectorId?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * El alta usa `displayName`, no `name`: es el nombre del campo en el
 * RegisterDto del backend, que valida con whitelist y rechaza lo que no
 * declara.
 */
export interface CreateUserRequest {
  email: string
  password: string
  displayName?: string
  roles?: UserRole[]
  sectorId?: string
}

export interface UpdateUserRequest {
  email?: string
  password?: string
  displayName?: string
  roles?: UserRole[]
  sectorId?: string
}
