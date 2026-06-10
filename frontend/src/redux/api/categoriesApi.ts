import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken ||
        localStorage.getItem('accessToken')
      if (token) headers.set('authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['Category', 'Brand'],
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: (featured?: boolean) => ({ url: '/categories', params: featured === true ? { featured: true } : {} }),
      providesTags: ['Category'],
    }),
    getCategoryBySlug: builder.query({
      query: (slug: string) => `/categories/${slug}`,
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation({
      query: (formData: FormData) => ({
        url: '/categories',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...data }: { id: string; [key: string]: any }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (id: string) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Category'],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useGetCategoryBySlugQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi
