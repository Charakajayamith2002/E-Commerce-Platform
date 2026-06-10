import apiClient from './apiClient'

export const authApi = {
  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    apiClient.post('/auth/register', data),

  login: (data: { email: string; password: string; rememberMe?: boolean }) =>
    apiClient.post('/auth/login', data),

  logout: () => apiClient.post('/auth/logout'),

  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (data: { email: string; token: string; newPassword: string }) =>
    apiClient.post('/auth/reset-password', data),

  refreshToken: (token: string) =>
    apiClient.post('/auth/refresh-token', { refreshToken: token }),

  getProfile: () => apiClient.get('/user/profile'),

  updateProfile: (data: any) => apiClient.put('/user/profile', data),

  uploadAvatar: (formData: FormData) =>
    apiClient.post('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/user/change-password', data),
}
