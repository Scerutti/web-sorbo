/**
 * Mocks de costos operativos para Sorbo Sabores.
 * Autor: Equipo Sorbo Sabores
 */

import { CostItem } from '../shared/types'
import { generateIdForMock } from '../shared/functions'

export const MOCK_COSTS: CostItem[] = [
  {
    id: generateIdForMock(),
    nombre: 'Empaquetado general',
    tipo: 'general',
    valor: 120,
    descripcion: 'Bolsas, etiquetas y empaques estándar'
  },
  {
    id: generateIdForMock(),
    nombre: 'Materia prima blends',
    tipo: 'blend',
    valor: 220,
    descripcion: 'Mezclas especiales de hierbas'
  },
  {
    id: generateIdForMock(),
    nombre: 'Materia prima cajas',
    tipo: 'caja',
    valor: 180,
    descripcion: 'Cartón y diseño para presentaciones premium'
  },
  {
    id: generateIdForMock(),
    nombre: 'Materia prima gin botánico',
    tipo: 'gin',
    valor: 350,
    descripcion: 'Botellas, corchos y botánicos para gin'
  },
  {
    id: generateIdForMock(),
    nombre: 'Amortización equipamiento',
    tipo: 'amortizable',
    valor: 90,
    descripcion: 'Distribución mensual del equipamiento clave'
  }
]


