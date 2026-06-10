import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { cartApi } from '../../services/cartService'
import { toast } from 'react-toastify'

interface CartItem {
  id: string
  productId: string
  productName: string
  productImage?: string
  productSlug: string
  variantId?: string
  variantName?: string
  sku?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  maxStock: number
}

interface CartState {
  items: CartItem[]
  subTotal: number
  shippingAmount: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  totalItems: number
  appliedCoupon?: string
  isLoading: boolean
  couponLoading: boolean
}

const initialState: CartState = {
  items: [],
  subTotal: 0,
  shippingAmount: 0,
  taxAmount: 0,
  discountAmount: 0,
  totalAmount: 0,
  totalItems: 0,
  isLoading: false,
  couponLoading: false,
}

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await cartApi.getCart()
    return res.data.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.errors?.[0] || 'Failed to load cart')
  }
})

export const addToCart = createAsyncThunk(
  'cart/add',
  async (data: { productId: string; variantId?: string; quantity?: number }, { dispatch, rejectWithValue }) => {
    try {
      await cartApi.addItem(data)
      await dispatch(fetchCart())
      toast.success('Added to cart!')
      return true
    } catch (error: any) {
      const msg = error.response?.data?.errors?.[0] || 'Failed to add to cart'
      toast.error(msg)
      return rejectWithValue(msg)
    }
  }
)

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (itemId: string, { dispatch }) => {
    await cartApi.removeItem(itemId)
    await dispatch(fetchCart())
    toast.info('Item removed from cart')
  }
)

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async (data: { itemId: string; quantity: number }, { dispatch }) => {
    await cartApi.updateItem(data.itemId, data.quantity)
    await dispatch(fetchCart())
  }
)

export const clearCart = createAsyncThunk('cart/clear', async (_, { dispatch }) => {
  await cartApi.clearCart()
  await dispatch(fetchCart())
})

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCoupon: (state, action: PayloadAction<{ code: string; discount: number }>) => {
      state.appliedCoupon = action.payload.code
      state.discountAmount = action.payload.discount
      state.totalAmount = state.subTotal + state.shippingAmount + state.taxAmount - action.payload.discount
    },
    removeCoupon: (state) => {
      state.appliedCoupon = undefined
      state.discountAmount = 0
      state.totalAmount = state.subTotal + state.shippingAmount + state.taxAmount
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.isLoading = true })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.items = action.payload.items || []
          state.subTotal = action.payload.subTotal
          state.shippingAmount = action.payload.shippingAmount
          state.taxAmount = action.payload.taxAmount
          state.discountAmount = action.payload.discountAmount
          state.totalAmount = action.payload.totalAmount
          state.totalItems = action.payload.totalItems
        }
      })
      .addCase(fetchCart.rejected, (state) => { state.isLoading = false })
  },
})

export const { setCoupon, removeCoupon } = cartSlice.actions
export default cartSlice.reducer
