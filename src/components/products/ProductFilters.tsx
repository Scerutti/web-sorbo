import React from 'react'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { ProductType, PRODUCT_TYPE_LABEL } from '../../shared/types'

interface ProductFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedType: ProductType | ''
  onTypeChange: (value: ProductType | '') => void
  productTypes: ProductType[]
}

/**
 * Filtros para la página de productos
 */
export const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  productTypes
}) => {
  const typeOptions = [
    { value: '', label: 'Todos los tipos' },
    ...productTypes.map(type => ({ value: type, label: PRODUCT_TYPE_LABEL[type] }))
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="text"
          label="Buscar por nombre"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Ej: Blend Relajante"
          aria-label="Buscar producto por nombre"
        />

        <Select
          label="Filtrar por tipo"
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value as ProductType | '')}
          options={typeOptions}
          aria-label="Filtrar por tipo de producto"
        />
      </div>
    </div>
  )
}

