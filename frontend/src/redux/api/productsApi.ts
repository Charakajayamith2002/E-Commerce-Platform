import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken ||
        localStorage.getItem('accessToken')
      if (token) headers.set('authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['Product', 'Review'],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params: Record<string, any>) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Product'],
    }),
    getProductBySlug: builder.query({
      query: (slug: string) => `/products/${slug}`,
      providesTags: ['Product'],
    }),
    getFeaturedProducts: builder.query({
      query: () => ({ url: '/products', params: { isFeatured: true, pageSize: 8 } }),
      providesTags: ['Product'],
    }),
    getProductReviews: builder.query({
      query: ({ productId, page = 1, pageSize = 10 }: { productId: string; page?: number; pageSize?: number }) =>
        `/products/${productId}/reviews?page=${page}&pageSize=${pageSize}`,
      providesTags: ['Review'],
    }),
    addReview: builder.mutation({
      query: ({ productId, ...data }: { productId: string; rating: number; title?: string; comment: string }) => ({
        url: `/products/${productId}/reviews`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Review', 'Product'],
    }),
    createProduct: builder.mutation({
      query: (formData: FormData) => ({
        url: '/products',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id: string) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Product'],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetFeaturedProductsQuery,
  useGetProductReviewsQuery,
  useAddReviewMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi
