import React, { useState, useRef, useEffect } from 'react'

interface AutocompleteOption {
  value: string
  label: string
}

interface AutocompleteProps {
  label?: string
  options: AutocompleteOption[]
  value: string
  onChange: (value: string) => void
  error?: string
  helperText?: string
  placeholder?: string
  required?: boolean
  'aria-label'?: string
  className?: string
  id?: string
}

/**
 * Componente Autocomplete con búsqueda y filtrado de opciones
 * Permite escribir para buscar y muestra coincidencias
 */
export const Autocomplete: React.FC<AutocompleteProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  placeholder = 'Buscar...',
  required = false,
  'aria-label': ariaLabel,
  className = '',
  id
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const autocompleteId = id || `autocomplete-${Math.random().toString(36).substring(2, 11)}`
  const errorId = error ? `${autocompleteId}-error` : undefined
  const helperId = helperText ? `${autocompleteId}-helper` : undefined

  // Filtrar opciones basado en la búsqueda
  // Si hay búsqueda activa, excluir la opción vacía y filtrar por coincidencias
  // Si no hay búsqueda, mostrar todas las opciones incluyendo la vacía
  const filteredOptions = searchQuery !== ''
    ? options.filter(option => 
        option.value !== '' && option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options

  // Obtener el label del valor seleccionado
  const selectedOption = options.find(opt => opt.value === value)
  
  // Determinar qué mostrar en el input
  // Prioridad: si hay searchQuery activo, siempre mostrar eso (permite escribir)
  // Si no hay searchQuery y el dropdown está cerrado, mostrar el label de la opción seleccionada (si existe y no es vacía)
  // Si no hay opción seleccionada o es vacía, mostrar string vacío
  // Cuando el dropdown está abierto, siempre mostrar searchQuery para permitir escribir
  const displayValue = searchQuery !== '' || isOpen
    ? searchQuery
    : (selectedOption && selectedOption.value !== '' ? selectedOption.label : '')

  // Sincronizar searchQuery cuando cambia el value externamente
  useEffect(() => {
    if (!isOpen) {
      const option = options.find(opt => opt.value === value)
      if (option && option.value !== '') {
        setSearchQuery('')
      } else {
        setSearchQuery('')
      }
    }
  }, [value, isOpen, options])

  // Cerrar cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        // Si hay una opción seleccionada válida, mantener su label, sino limpiar
        if (value && value !== '') {
          setSearchQuery('')
        } else {
          setSearchQuery('')
        }
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [value])

  // Manejar selección de opción
  const handleSelect = (option: AutocompleteOption) => {
    onChange(option.value)
    setIsOpen(false)
    setSearchQuery('')
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }

  // Manejar input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    setIsOpen(true)
    setHighlightedIndex(-1)
    
    // Si se borra todo, limpiar selección
    if (query === '') {
      onChange('')
    }
  }

  // Manejar focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsOpen(true)
    // Si hay una opción seleccionada válida (no vacía), cargar su label para permitir edición
    // Si la opción es vacía o no hay opción, limpiar para escribir desde cero
    if (selectedOption && selectedOption.value !== '') {
      setSearchQuery(selectedOption.label)
      // Seleccionar todo el texto para facilitar reemplazo
      setTimeout(() => {
        e.target.select()
      }, 0)
    } else {
      setSearchQuery('')
    }
  }

  // Manejar teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => 
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter' && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
      e.preventDefault()
      handleSelect(filteredOptions[highlightedIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchQuery('')
      setHighlightedIndex(-1)
      inputRef.current?.blur()
    }
  }

  // Scroll a la opción destacada
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex])

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label
          htmlFor={autocompleteId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          id={autocompleteId}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            w-full px-3 py-2 border rounded-lg
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            border-gray-300 dark:border-gray-600
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : helperId}
          aria-errormessage={error ? errorId : undefined}
          aria-label={ariaLabel}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={`${autocompleteId}-listbox`}
          role="combobox"
        />
        
        {/* Icono de dropdown */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Lista de opciones */}
        {isOpen && (
          <ul
            ref={listRef}
            id={`${autocompleteId}-listbox`}
            role="listbox"
            className={`
              absolute z-50 w-full mt-1 max-h-60 overflow-auto
              bg-white dark:bg-gray-800
              border border-gray-300 dark:border-gray-600
              rounded-lg shadow-lg
            `}
          >
            {filteredOptions.length === 0 && searchQuery !== '' ? (
              <li
                className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center"
                role="option"
              >
                Producto no encontrado
              </li>
            ) : filteredOptions.length === 0 ? (
              <li
                className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center"
                role="option"
              >
                No hay opciones disponibles
              </li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleSelect(option)}
                  className={`
                    px-4 py-2 cursor-pointer text-sm
                    transition-colors
                    ${index === highlightedIndex || option.value === value
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100'
                      : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  )
}

