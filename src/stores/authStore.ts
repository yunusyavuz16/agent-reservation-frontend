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
    phoneNumber: string
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

          set({
            isAuthenticated: true,
            user,
            token,
            loading: false
          })
        } catch (err) {
          const errorMessage =
            err.response?.data?.message || 'Login failed. Please check your credentials.'

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
          await api.post('/Auth/register', {
            firstName,
            lastName,
            email,
            password,
            phoneNumber
          })

          set({ loading: false })
        } catch (err) {
          const errorMessage =
            err.response?.data?.message || 'Registration failed. Please try again.'

          set({ loading: false, error: errorMessage })
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null
        })
      },

      checkAuthStatus: () => {
        const state = get()
        if (state.token) {
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