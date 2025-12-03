/**
 * Utilidades para manejar borradores de ventas en localStorage
 */

export interface SaleDraftItem {
  productId: string
  productNombre: string
  quantity: number
  precioUnitario: number
}

export interface SaleDraft {
  id: string
  fecha: string // Timestamp de creación
  saleData: {
    items: SaleDraftItem[]
    esMayorista: boolean
    total: number
  }
}

const STORAGE_KEY = 'sales_drafts'

/**
 * Guarda un borrador en localStorage
 */
export const saveDraft = (draft: SaleDraft): void => {
  try {
    const drafts = getDrafts()
    // Si ya existe un borrador con el mismo ID, reemplazarlo
    const existingIndex = drafts.findIndex(d => d.id === draft.id)
    if (existingIndex >= 0) {
      drafts[existingIndex] = draft
    } else {
      drafts.push(draft)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
  } catch (error) {
    console.error('Error guardando borrador:', error)
  }
}

/**
 * Obtiene todos los borradores del localStorage
 */
export const getDrafts = (): SaleDraft[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    return JSON.parse(data) as SaleDraft[]
  } catch (error) {
    console.error('Error leyendo borradores:', error)
    return []
  }
}

/**
 * Elimina un borrador por ID
 */
export const deleteDraft = (draftId: string): void => {
  try {
    const drafts = getDrafts()
    const filtered = drafts.filter(d => d.id !== draftId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error eliminando borrador:', error)
  }
}

/**
 * Limpia todos los borradores
 */
export const clearDrafts = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error limpiando borradores:', error)
  }
}

/**
 * Genera un ID único para un borrador
 */
export const generateDraftId = (): string => {
  return `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

