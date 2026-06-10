import apiClient from './apiClient'

export const cartApi = {
  getCart: () => apiClient.get('/cart'),

  addItem: (data: { productId: string; variantId?: string; quantity?: number }) =>
    apiClient.post('/cart/items', data),

  updateItem: (itemId: string, quantity: number) =>
    apiClient.put(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) => apiClient.delete(`/cart/items/${itemId}`),

  clearCart: () => apiClient.delete('/cart'),

  applyCoupon: (code: string) => apiClient.post('/cart/coupon', { couponCode: code }),
}
