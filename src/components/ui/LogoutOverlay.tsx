import React from 'react'

/**
 * Overlay que bloquea la interacción durante el logout
 */
export const LogoutOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-12 w-12 text-primary-600 dark:text-primary-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Cerrando sesión...
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Por favor espera mientras cerramos tu sesión de forma segura.
          </p>
        </div>
      </div>
    </div>
  )
}

