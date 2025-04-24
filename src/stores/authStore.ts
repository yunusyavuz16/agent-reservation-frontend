import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'
import { AuthState, User } from '../types'

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber: string,
    confirmPassword?: string
  ) => Promise<void>
  logout: () => void
  checkAuthStatus: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ loading: true, error: null })

        try {
          const response = await api.post('/Auth/login', {
            email,
            password
          })

          const { token, user } = response.data

          // Set auth header for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          set({
            isAuthenticated: true,
            user,
            token,
            loading: false
          })
        } catch (err: any) {
          const errorMessage =
            err.response?.data?.message || 'Login failed'

          set({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: errorMessage
          })

          throw err
        }
      },

      register: async (
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        phoneNumber: string,
        confirmPassword?: string
      ) => {
        set({ loading: true, error: null })

        try {
          await api.post('/Auth/register', {
            firstName,
            lastName,
            email,
            password,
            confirmPassword: confirmPassword || password, // Send confirmPassword to backend
            phoneNumber
          })

          set({ loading: false })
        } catch (err: any) {
          let errorMessage = 'Registration failed';

          // Handle various error response formats
          if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          } else if (err.response?.data?.errors) {
            // Handle validation errors object
            const errors = err.response.data.errors;
            const firstError = Object.values(errors)[0];
            if (Array.isArray(firstError) && firstError.length > 0) {
              errorMessage = firstError[0];
            }
          }

          set({ loading: false, error: errorMessage })
          throw err
        }
      },

      logout: () => {
        // Remove auth header
        delete api.defaults.headers.common['Authorization']

        set({
          isAuthenticated: false,
          user: null,
          token: null
        })
      },

      checkAuthStatus: () => {
        const state = get()
        if (state.token) {
          // Set auth header for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
          set({ isAuthenticated: true })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token
      })
    }
  )
)