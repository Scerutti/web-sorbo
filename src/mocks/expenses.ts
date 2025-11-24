import { Expense } from '../shared/types'
import { generateIdForMock } from '../shared/functions'

/**
 * Datos mockeados de gastos
 * Para uso futuro cuando se implemente la sección de gastos
 */
const generateMockDate = (daysAgo: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

export const MOCK_EXPENSES: Expense[] = [
  {
    id: generateIdForMock(),
    date: generateMockDate(5),
    description: 'Compra de hierbas - Proveedor A',
    amount: 15000,
    category: 'Insumos'
  },
  {
    id: generateIdForMock(),
    date: generateMockDate(10),
    description: 'Alquiler local',
    amount: 45000,
    category: 'Alquiler'
  },
  {
    id: generateIdForMock(),
    date: generateMockDate(15),
    description: 'Servicios públicos',
    amount: 8500,
    category: 'Servicios'
  },
  {
    id: generateIdForMock(),
    date: generateMockDate(20),
    description: 'Compra de envases',
    amount: 12000,
    category: 'Insumos'
  }
]

