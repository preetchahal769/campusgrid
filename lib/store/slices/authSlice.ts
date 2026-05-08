import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'TEACHER' | 'PRINCIPAL' | 'ADMIN'
  avatarUrl?: string
  lastLogin?: string
}

interface AuthState {
  user: User | null
  userRole: 'student' | 'teacher' | 'principal' | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Helper to get initial state from localStorage
const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('cg_user')
    const savedRole = localStorage.getItem('cg_role')
    
    if (savedUser && savedRole) {
      return {
        user: JSON.parse(savedUser),
        userRole: savedRole as any,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    }
  }
  
  return {
    user: null,
    userRole: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }
}

const initialState: AuthState = getInitialState()

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setAuthSuccess: (state, action: PayloadAction<{ user: User; access_token: string }>) => {
      const { user } = action.payload
      state.user = user
      state.userRole = user.role.toLowerCase() as any
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
      
      // Persist to localStorage
      localStorage.setItem('cg_user', JSON.stringify(user))
      localStorage.setItem('cg_role', state.userRole || '')
    },
    setAuthFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
      state.isAuthenticated = false
    },
    logout: (state) => {
      state.user = null
      state.userRole = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
      
      // Clear localStorage
      localStorage.removeItem('cg_user')
      localStorage.removeItem('cg_role')
    },
    clearError: (state) => {
      state.error = null
    }
  },
})

export const { setLoading, setAuthSuccess, setAuthFailure, logout, clearError } = authSlice.actions
export default authSlice.reducer
