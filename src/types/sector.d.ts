export interface Sector {
  id: string
  nombre: string
  descripcion?: string
  /**
   * Baja lógica. Un sector inactivo no admite ventas ni puede recibir stock,
   * pero conserva su saldo y su historial de movimientos.
   */
  activo: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateSectorRequest {
  nombre: string
  descripcion?: string
  activo?: boolean
}

export interface UpdateSectorRequest {
  nombre?: string
  descripcion?: string
  activo?: boolean
}
