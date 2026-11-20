import React, { Suspense, useEffect, useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { useTheme } from '../hooks/useTheme'
import { Button } from '../components/ui/Button'
import { UserMenu } from '../components/ui/UserMenu'
import { PageSkeleton } from '../components/ui/PageSkeleton'
import { prefetchSection, preloadAllPages } from '../lib/prefetch'

/**
 * Layout principal con navbar y toolbar responsive
 */
export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  // El JS de las demás secciones se baja en segundo plano apenas hay
  // sesión, así el primer ingreso a cada una no espera la descarga.
  useEffect(() => preloadAllPages(), [])

  // Apuntar a un link ya pide los datos de esa sección: para cuando llega
  // el click, la página suele tenerlos en caché.
  const prefetchProps = (path: string) => ({
    onMouseEnter: () => prefetchSection(path),
    onFocus: () => prefetchSection(path),
    onTouchStart: () => prefetchSection(path)
  })

  const esAdmin = !!user?.roles?.includes('admin')

  // Sectores (que incluye usuarios) es administracion: el backend responde
  // 403 a cualquier otro rol, asi que ni se ofrece. Etiquetas cortas para
  // que el menu entre en una sola linea.
  const navLinks = [
    { path: '/dashboard', label: 'Inicio' },
    { path: '/products', label: 'Productos' },
    { path: '/stock', label: 'Stock' },
    { path: '/sales', label: 'Ventas' },
    { path: '/costs', label: 'Costos' },
    { path: '/tipos-costo', label: 'Tipos de costo' },
    { path: '/expenses', label: 'Gastos e ingresos' },
    { path: '/sectores', label: 'Sectores y usuarios', soloAdmin: true }
  ].filter(link => !link.soloAdmin || esAdmin)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-xl font-bold whitespace-nowrap text-primary-600 dark:text-primary-400">
                Sorbo Sabores
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  {...prefetchProps(link.path)}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors
                    ${isActive(link.path)
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>

              <div className="hidden xl:flex items-center">
                <UserMenu />
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Menú"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="xl:hidden pb-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  {...prefetchProps(link.path)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    block px-3 py-2 rounded-md text-base font-medium
                    ${isActive(link.path)
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                  {user?.name || user?.email}
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} fullWidth>
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/*
          Suspense propio para las páginas: mientras baja el JS de una
          sección se ve el esqueleto dentro del contenido y el menú queda
          en pantalla. Sin esto subía al Suspense de App.tsx y toda la app
          se reemplazaba por un "Cargando..." de pantalla completa.
        */}
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}

