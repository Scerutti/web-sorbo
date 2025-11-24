import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '@/api/products.api'
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/types/product'

/**
 * Hook para obtener todos los productos
 */
export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: getProducts
  })
}

/**
 * Hook para obtener un producto por ID
 */
export const useProduct = (id: string) => {
  return useQuery<Product>({
    queryKey: ['products', id],
    queryFn: () => getProductById(id),
    enabled: !!id
  })
}

/**
 * Hook para crear un producto
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (product: CreateProductRequest) => createProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
}

/**
 * Hook para actualizar un producto
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, product }: { id: string; product: UpdateProductRequest }) =>
      updateProduct(id, product),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['products', data.id] })
    }
  })
}

/**
 * Hook para eliminar un producto
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
}

