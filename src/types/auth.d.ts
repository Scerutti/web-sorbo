import type { UserRole } from './user'

export interface User {
  id: string
  email: string
  name: string
  roles?: UserRole[]
  /** Sector en el que opera: sus ventas descuentan de ese stock. */
  sectorId?: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RefreshTokenResponse {
  accessToken: string
}

export interface ResetPasswordRequest {
  email: string
}

