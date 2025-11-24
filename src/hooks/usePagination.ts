import { useState, useMemo } from 'react'
import { paginate } from '../shared/functions'
import { ITEMS_PER_PAGE } from '../shared/constants'

/**
 * Hook para manejar paginación de arrays
 * @param items - Array a paginar
 * @param pageSize - Tamaño de página (default: ITEMS_PER_PAGE)
 * @returns Objeto con items paginados, metadata y funciones de navegación
 */
export function usePagination<T>(items: T[], pageSize: number = ITEMS_PER_PAGE) {
  const [currentPage, setCurrentPage] = useState(1)

  const paginated = useMemo(() => {
    return paginate(items, currentPage, pageSize)
  }, [items, currentPage, pageSize])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= paginated.totalPages) {
      setCurrentPage(page)
    }
  }

  const nextPage = () => {
    if (paginated.hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const previousPage = () => {
    if (paginated.hasPreviousPage) {
      setCurrentPage(prev => prev - 1)
    }
  }

  // Resetear a página 1 cuando cambien los items
  useState(() => {
    setCurrentPage(1)
  })

  return {
    ...paginated,
    goToPage,
    nextPage,
    previousPage,
    setCurrentPage
  }
}

