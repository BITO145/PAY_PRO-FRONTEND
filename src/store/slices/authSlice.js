import { createSlice } from '@reduxjs/toolkit'
import Cookies from 'js-cookie'

// Safe JSON parsing helper
const safeJsonParse = (str, fallback = null) => {
  try {
    return str ? JSON.parse(str) : fallback
  } catch {
    return fallback
  }
}

const initialState = {
  user: safeJsonParse(localStorage.getItem('user')),
  token: Cookies.get('token') || null,
  isAuthenticated: !!Cookies.get('token'),
  loading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.error = null
      // Store token in cookie and user in localStorage
      Cookies.set('token', action.payload.token, { expires: 7 })
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.error = action.payload
      Cookies.remove('token')
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.error = null
      Cookies.remove('token')
      localStorage.removeItem('user')
    },
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    }
  }
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  setUser
} = authSlice.actions

export default authSlice.reducer