import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
import { AuthState, User } from '../types'

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber: string
  ) => Promise<void>
  logout: () => void
  checkAuthStatus: () => void
}

const API_URL = 'http://localhost:5000/api'

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
          const response = await axios.post(`${API_URL}/Auth/login`, {
            email,
            password
          })

          const { token, user } = response.data

          // Set auth header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

          set({
            isAuthenticated: true,
            user,
            token,
            loading: false
          })
        } catch (err) {
          const errorMessage =
            axios.isAxiosError(err)
              ? err.response?.data?.message || 'Login failed'
              : 'An unexpected error occurred'

          set({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: errorMessage
          })
        }
      },

      register: async (
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        phoneNumber: string
      ) => {
        set({ loading: true, error: null })

        try {
          await axios.post(`${API_URL}/Auth/register`, {
            firstName,
            lastName,
            email,
            password,
            phoneNumber
          })

          set({ loading: false })
        } catch (err) {
          const errorMessage =
            axios.isAxiosError(err)
              ? err.response?.data?.message || 'Registration failed'
              : 'An unexpected error occurred'

          set({ loading: false, error: errorMessage })
        }
      },

      logout: () => {
        // Remove auth header
        delete axios.defaults.headers.common['Authorization']

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
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
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