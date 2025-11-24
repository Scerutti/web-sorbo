// Re-export all types for convenience
export * from './auth'
export * from './user'
export * from './product'
export * from './cost'
export * from './sale'

// Common types
export type StockStatus = 'good' | 'low' | 'out'

export interface StockSummary {
  total: number
  good: number
  low: number
  out: number
  goodPercentage: number
  lowPercentage: number
  outPercentage: number
}

export interface Expense {
  id: string
  date: string
  description: string
  amount: number
  category: string
}

