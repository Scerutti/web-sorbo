import { axiosPrivate } from './http'
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/types/product'

/**
 * Obtiene todos los productos
 */
export const getProducts = async (): Promise<Product[]> => {
  const { data } = await axiosPrivate.get<Product[]>('/products')
  return data
}

/**
 * Obtiene un producto por ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  const { data } = await axiosPrivate.get<Product>(`/products/${id}`)
  return data
}

/**
 * Crea un nuevo producto
 */
export const createProduct = async (product: CreateProductRequest): Promise<Product> => {
  const { data } = await axiosPrivate.post<Product>('/products', product)
  return data
}

/**
 * Actualiza un producto existente
 */
export const updateProduct = async (id: string, product: UpdateProductRequest): Promise<Product> => {
  const { data } = await axiosPrivate.patch<Product>(`/products/${id}`, product)
  return data
}

/**
 * Elimina un producto
 */
export const deleteProduct = async (id: string): Promise<void> => {
  await axiosPrivate.delete(`/products/${id}`)
}

