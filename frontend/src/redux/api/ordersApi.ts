import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken ||
        localStorage.getItem('accessToken')
      if (token) headers.set('authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: ({ page = 1, pageSize = 10 } = {}) =>
        `/orders?page=${page}&pageSize=${pageSize}`,
      providesTags: ['Order'],
    }),
    getOrderById: builder.query({
      query: (id: string) => `/orders/${id}`,
      providesTags: ['Order'],
    }),
    createOrder: builder.mutation({
      query: (data: any) => ({
        url: '/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, ...data }: { id: string; [key: string]: any }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),
    createPaymentIntent: builder.mutation({
      query: (orderId: string) => ({
        url: '/payments/create-intent',
        method: 'POST',
        body: { orderId },
      }),
    }),
    getAllOrders: builder.query({
      query: (params: Record<string, any> = {}) => ({
        url: '/orders/all',
        params,
      }),
      providesTags: ['Order'],
    }),
  }),
})

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useCreatePaymentIntentMutation,
  useGetAllOrdersQuery,
} = ordersApi
