import apiClient from './apiClient'

export const wishlistApi = {
  getWishlist: () => apiClient.get('/wishlist'),
  addItem: (productId: string) => apiClient.post(`/wishlist/${productId}`),
  removeItem: (productId: string) => apiClient.delete(`/wishlist/${productId}`),
}
