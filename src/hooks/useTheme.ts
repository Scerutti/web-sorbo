import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

/**
 * Hook para manejar tema dark/light con persistencia en localStorage
 * - Detecta preferencia del sistema al iniciar
 * - Permite toggle manual
 * - Persiste preferencia en localStorage
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Revisar localStorage primero
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved === 'light' || saved === 'dark') {
      return saved
    }

    // Si no hay preferencia guardada, usar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return { theme, toggleTheme, setTheme }
}

