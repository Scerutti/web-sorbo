import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

/**
 * Página 404 - No encontrada
 */
export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Volver al Inicio</Button>
        </Link>
      </div>
    </div>
  )
}

