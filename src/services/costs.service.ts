/**
 * Servicio de costos operativos.
 * Autor: Equipo Sorbo Sabores
 */

// import api from '../shared/httpPrivate'
import { CostItem } from '../shared/types'
import { shouldUseMocks, mockResponse } from '../mocks/serverMock'
import { addMockCost, deleteMockCost, getMockCosts, updateMockCost } from '../mocks/mockStore'

export const costsService = {
  async getAll(): Promise<CostItem[]> {
    if (shouldUseMocks()) {
      return mockResponse<CostItem[]>(getMockCosts(), 400)
    }

    // NOTE: Implementar llamada real al backend cuando esté disponible.
    // const response = await api.get<CostItem[]>('/costs')
    // return response.data

    throw new Error('getAll no implementado sin mocks')
  },

  async getById(id: string): Promise<CostItem> {
    if (shouldUseMocks()) {
      const cost = getMockCosts().find(item => item.id === id)
      if (!cost) {
        throw new Error('Costo no encontrado')
      }
      return mockResponse<CostItem>(cost, 300)
    }

    // NOTE: Implementar llamada real al backend cuando esté disponible.
    // const response = await api.get<CostItem>(`/costs/${id}`)
    // return response.data

    throw new Error('getById no implementado sin mocks')
  },

  async create(cost: Omit<CostItem, 'id'>): Promise<CostItem> {
    if (shouldUseMocks()) {
      const newCost = addMockCost(cost)
      return mockResponse<CostItem>(newCost, 500)
    }

    // NOTE: Implementar llamada real al backend cuando esté disponible.
    // const response = await api.post<CostItem>('/costs', cost)
    // return response.data

    throw new Error('create no implementado sin mocks')
  },

  async update(id: string, updates: Partial<CostItem>): Promise<CostItem> {
    if (shouldUseMocks()) {
      const updated = updateMockCost(id, updates)
      return mockResponse<CostItem>(updated, 500)
    }

    // NOTE: Implementar llamada real al backend cuando esté disponible.
    // const response = await api.put<CostItem>(`/costs/${id}`, updates)
    // return response.data

    throw new Error('update no implementado sin mocks')
  },

  async delete(id: string): Promise<void> {
    if (shouldUseMocks()) {
      deleteMockCost(id)
      return mockResponse<void>(undefined, 300)
    }

    // NOTE: Implementar llamada real al backend cuando esté disponible.
    // await api.delete(`/costs/${id}`)
  }
}


