import React from 'react'
import { ResponsiveContainer } from 'recharts'

interface ChartWrapperProps {
  children: React.ReactElement
  title?: string
  height?: number
  className?: string
}

/**
 * Wrapper para gráficos de Recharts con responsive container
 */
export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  children,
  title,
  height = 300,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  )
}

