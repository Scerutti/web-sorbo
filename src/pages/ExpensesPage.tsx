import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

/**
 * Página de gastos - Sección en construcción
 */
export const ExpensesPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 sm:p-12 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-6">
          <svg className="h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Sección en Construcción
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Estamos trabajando en esta funcionalidad. Pronto estará disponible.
        </p>

        <div className="space-y-4">
          <Link to="/dashboard">
            <Button variant="primary" fullWidth>
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

