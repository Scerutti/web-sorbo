import { queryClient } from './queryClient'
import { productsQuery } from '@/hooks/useProducts'
import { costsQuery } from '@/hooks/useCosts'
import { tiposCostoQuery } from '@/hooks/useTiposCosto'
import { salesQuery } from '@/hooks/useSales'
import { sectoresQuery } from '@/hooks/useSectores'
import { usersQuery } from '@/hooks/useUsers'
import { gastosQuery } from '@/hooks/useExpenses'
import { stockResumenQuery, movimientosQuery } from '@/hooks/useStock'

/**
 * Precarga de secciones.
 *
 * Entrar a una sección por primera vez costaba dos esperas seguidas: bajar
 * el JS de la página y, recién con la página montada, pedir sus datos. Acá
 * se adelantan las dos: el JS de todas las páginas se baja cuando el
 * navegador está libre, y los datos de una sección se piden cuando el
 * usuario apunta al link del menú, antes del click.
 */

/** Mismo módulo que App.tsx carga con React.lazy: el navegador lo reusa. */
const pageModules: Record<string, () => Promise<unknown>> = {
  '/dashboard': () => import('@/pages/DashboardPage'),
  '/products': () => import('@/pages/ProductsPage'),
  '/stock': () => import('@/pages/StockPage'),
  '/sales': () => import('@/pages/SalesPage'),
  '/costs': () => import('@/pages/CostsPage'),
  '/tipos-costo': () => import('@/pages/TiposCostoPage'),
  '/expenses': () => import('@/pages/ExpensesPage'),
  '/sectores': () => import('@/pages/SectoresUsuariosPage')
}

/**
 * Datos que cada sección necesita para mostrarse. Usan las mismas queries que
 * los hooks, así que lo precargado es exactamente lo que la página lee.
 * Con staleTime de 5 minutos, si ya está en caché no se vuelve a pedir.
 */
const pageQueries: Record<string, Array<{ queryKey: readonly unknown[]; queryFn: () => Promise<unknown> }>> = {
  '/dashboard': [productsQuery, costsQuery],
  '/products': [productsQuery, costsQuery, tiposCostoQuery],
  '/stock': [stockResumenQuery(), movimientosQuery()],
  '/sales': [salesQuery, productsQuery],
  '/costs': [costsQuery, tiposCostoQuery, gastosQuery],
  '/tipos-costo': [tiposCostoQuery],
  '/expenses': [gastosQuery],
  '/sectores': [sectoresQuery, usersQuery]
}

const ignore = () => undefined

/** JS y datos de una sección. Pensado para hover/focus/touch en el menú. */
export const prefetchSection = (path: string): void => {
  pageModules[path]?.().catch(ignore)
  pageQueries[path]?.forEach(query => {
    queryClient.prefetchQuery(query).catch(ignore)
  })
}

/**
 * Baja el JS de todas las secciones cuando el navegador está libre. Son
 * chunks chicos (10–20 KB) y evitan el "Cargando..." del primer ingreso.
 */
export const preloadAllPages = (): (() => void) => {
  const run = () => Object.values(pageModules).forEach(load => load().catch(ignore))

  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(run, { timeout: 3000 })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(run, 1500)
  return () => window.clearTimeout(id)
}
