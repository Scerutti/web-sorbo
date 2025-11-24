export interface User {
  id: string
  email: string
  name: string
  role?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateUserRequest {
  email: string
  name: string
  password: string
  role?: string
}

export interface UpdateUserRequest {
  email?: string
  name?: string
  role?: string
}

