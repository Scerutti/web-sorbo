/**
 * Mock server utility para simular llamadas API
 * Proporciona utilidades para simular latencia y errores
 * 
 * Uso:
 * - Importar desde servicios cuando VITE_USE_MOCKS=true
 * - Reemplazar con llamadas axios reales cuando backend esté listo
 */

/**
 * Simula latencia de red
 * @param ms - Milisegundos de delay (default: 500)
 * @returns Promise que se resuelve después del delay
 */
export function simulateLatency(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Simula un error de red
 * @param message - Mensaje de error
 * @param statusCode - Código HTTP (default: 500)
 * @returns Promise rechazada con error simulado
 */
export function simulateError(message: string = 'Error simulado', statusCode: number = 500): Promise<never> {
  const error = new Error(message)
  Object.assign(error, {
    response: {
      status: statusCode,
      data: { message }
    }
  })
  return Promise.reject(error)
}

/**
 * Determina si se deben usar mocks basado en variable de entorno
 * Por defecto, usa mocks si no está configurada la variable o si es 'true'
 * 
 * NOTA: En Vite, las variables de entorno deben tener prefijo VITE_ para ser accesibles
 */
export function shouldUseMocks(): boolean {
  // Intentar leer VITE_USE_MOCKS primero (prefijo correcto para Vite)
  const useMocks = import.meta.env.VITE_USE_MOCKS
  
  // Si no está definida, usar mocks por defecto (modo desarrollo)
  if (useMocks === undefined || useMocks === null || useMocks === '') {
    return true
  }
  
  // Si está definida como 'false', no usar mocks
  if (useMocks === 'false') {
    return false
  }
  
  // Cualquier otro valor (incluyendo 'true') usa mocks
  return true
}

/**
 * Wrapper para respuestas mockeadas con latencia
 * @param data - Datos a retornar
 * @param delay - Delay en ms (default: 500)
 * @returns Promise que resuelve con los datos después del delay
 */
export function mockResponse<T>(data: T, delay: number = 500): Promise<T> {
  return simulateLatency(delay).then(() => data)
}

