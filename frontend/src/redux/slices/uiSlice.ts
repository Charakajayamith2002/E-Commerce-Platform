import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  isDarkMode: boolean
  isCartOpen: boolean
  isMobileMenuOpen: boolean
  isSearchOpen: boolean
}

const getInitialDarkMode = () => {
  const stored = localStorage.getItem('darkMode')
  if (stored !== null) return stored === 'true'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const initialState: UIState = {
  isDarkMode: getInitialDarkMode(),
  isCartOpen: false,
  isMobileMenuOpen: false,
  isSearchOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode
      localStorage.setItem('darkMode', String(state.isDarkMode))
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload
      localStorage.setItem('darkMode', String(action.payload))
    },
    toggleCart: (state) => { state.isCartOpen = !state.isCartOpen },
    setCartOpen: (state, action: PayloadAction<boolean>) => { state.isCartOpen = action.payload },
    toggleMobileMenu: (state) => { state.isMobileMenuOpen = !state.isMobileMenuOpen },
    closeMobileMenu: (state) => { state.isMobileMenuOpen = false },
    toggleSearch: (state) => { state.isSearchOpen = !state.isSearchOpen },
    closeSearch: (state) => { state.isSearchOpen = false },
  },
})

export const {
  toggleDarkMode, setDarkMode, toggleCart, setCartOpen,
  toggleMobileMenu, closeMobileMenu, toggleSearch, closeSearch,
} = uiSlice.actions
export default uiSlice.reducer
