import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

/**
 * Página para restablecer contraseña
 */
export const ResetPasswordPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Restablecer Contraseña
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Contactá a soporte para poder restablecerla.
        </p>

        <Link to="/login">
          <Button variant="primary" fullWidth>
            Volver al Login
          </Button>
        </Link>
      </div>
    </div>
  )
}

