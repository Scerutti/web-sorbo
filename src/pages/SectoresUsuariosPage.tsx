import React from 'react'
import { SectoresPage } from './SectoresPage'
import { UsuariosPage } from './UsuariosPage'

/**
 * Sectores y usuarios en una sola pantalla.
 *
 * Van juntos porque se administran juntos: un usuario sin sector no puede
 * vender, y un sector sin usuarios no vende. Verlos en la misma página deja
 * ver de un vistazo quién opera en cada sector, y le ahorra una entrada al
 * menú.
 * Autor: Equipo Sorbo Sabores
 */
export const SectoresUsuariosPage: React.FC = () => {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Sectores y usuarios
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Cada sector maneja su propio stock. Cada usuario opera en un sector, y
          sus ventas descuentan de ese saldo.
        </p>
      </div>

      <section aria-labelledby="titulo-sectores">
        <SectoresPage />
      </section>

      <section aria-labelledby="titulo-usuarios">
        <UsuariosPage />
      </section>
    </div>
  )
}
