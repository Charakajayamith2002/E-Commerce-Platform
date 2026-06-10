import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { wishlistApi } from '../../services/wishlistService'
import { toast } from 'react-toastify'

interface WishlistItem {
  id: string
  productId: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  primaryImage?: string
  averageRating: number
  reviewCount: number
  isInStock: boolean
  categoryName: string
  createdAt: string
}

interface WishlistState {
  items: WishlistItem[]
  isLoading: boolean
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
}

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => {
  const res = await wishlistApi.getWishlist()
  return res.data.data
})

export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async (productId: string, { dispatch }) => {
    try {
      await wishlistApi.addItem(productId)
      await dispatch(fetchWishlist())
      toast.success('Added to wishlist!')
    } catch {
      toast.error('Failed to add to wishlist')
    }
  }
)

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (productId: string, { dispatch }) => {
    await wishlistApi.removeItem(productId)
    await dispatch(fetchWishlist())
    toast.info('Removed from wishlist')
  }
)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.isLoading = true })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload || []
      })
      .addCase(fetchWishlist.rejected, (state) => { state.isLoading = false })
  },
})

export default wishlistSlice.reducer
