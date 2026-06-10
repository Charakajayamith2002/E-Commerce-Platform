import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authApi } from '../../services/authService'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  phoneNumber?: string
  emailConfirmed: boolean
  roles: string[]
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('accessToken')
  if (!token) return rejectWithValue('No token')
  try {
    const response = await authApi.getProfile()
    return response.data.data
  } catch {
    localStorage.removeItem('accessToken')
    return rejectWithValue('Session expired')
  }
})

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string; rememberMe?: boolean }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials)
      const { accessToken, user } = response.data.data
      localStorage.setItem('accessToken', accessToken)
      return { accessToken, user }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors?.[0] || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: { firstName: string; lastName: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.register(data)
      const { accessToken, user } = response.data.data
      localStorage.setItem('accessToken', accessToken)
      return { accessToken, user }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors?.[0] || 'Registration failed')
    }
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout()
  } finally {
    localStorage.removeItem('accessToken')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
    },
    clearAuth: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      localStorage.removeItem('accessToken')
    },
    updateUserAvatar: (state, action: PayloadAction<string>) => {
      if (state.user) state.user.avatarUrl = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => { state.isLoading = true })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
      })
      .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
      })
  },
})

export const { setCredentials, clearAuth, updateUserAvatar } = authSlice.actions
export default authSlice.reducer
