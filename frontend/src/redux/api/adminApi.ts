import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken ||
        localStorage.getItem('accessToken')
      if (token) headers.set('authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['AdminStats', 'AdminUsers', 'AdminOrders'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/admin/dashboard',
      providesTags: ['AdminStats'],
    }),
    getAdminUsers: builder.query({
      query: (params: Record<string, any> = {}) => ({ url: '/admin/users', params }),
      providesTags: ['AdminUsers'],
    }),
    blockUser: builder.mutation({
      query: (userId: string) => ({
        url: `/admin/users/${userId}/block`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AdminUsers'],
    }),
    deleteUser: builder.mutation({
      query: (userId: string) => ({ url: `/admin/users/${userId}`, method: 'DELETE' }),
      invalidatesTags: ['AdminUsers'],
    }),
    changeUserRole: builder.mutation({
      query: ({ userId, role }: { userId: string; role: string }) => ({
        url: `/admin/users/${userId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['AdminUsers'],
    }),
  }),
})

export const {
  useGetDashboardStatsQuery,
  useGetAdminUsersQuery,
  useBlockUserMutation,
  useDeleteUserMutation,
  useChangeUserRoleMutation,
} = adminApi
