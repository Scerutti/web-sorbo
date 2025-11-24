import React from 'react'

interface TableProps {
  children: React.ReactNode
  className?: string
}

interface TableHeaderProps {
  children: React.ReactNode
}

interface TableRowProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

interface TableCellProps {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

/**
 * Componente Table con subcomponentes
 */
export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed ${className}`}>
        {children}
      </table>
    </div>
  )
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  return (
    <thead className="bg-gray-50 dark:bg-gray-800">
      <tr>{children}</tr>
    </thead>
  )
}

export const TableRow: React.FC<TableRowProps> = ({ children, onClick, className = '' }) => {
  return (
    <tr
      onClick={onClick}
      className={`
        ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
        bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700
        ${className}
      `}
    >
      {children}
    </tr>
  )
}

export const TableCell: React.FC<TableCellProps> = ({ children, className = '', align = 'left' }) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <td className={`
      px-4 py-3 text-sm text-gray-900 dark:text-gray-100
      ${alignClasses[align]}
      ${className}
    `}>
      {children}
    </td>
  )
}

export const TableHead: React.FC<TableCellProps> = ({ children, className = '', align = 'left' }) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <th className={`
      px-4 py-3 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider
      ${alignClasses[align]}
      ${className}
    `}>
      {children}
    </th>
  )
}

