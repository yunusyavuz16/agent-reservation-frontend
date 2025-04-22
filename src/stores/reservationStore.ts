import { create } from 'zustand'
import axios from 'axios'
import { Reservation, ReservationFormValues } from '../types'

interface ReservationState {
  reservations: Reservation[]
  userReservations: Reservation[]
  selectedReservation: Reservation | null
  loading: boolean
  error: string | null

  fetchReservations: () => Promise<void>
  fetchUserReservations: () => Promise<void>
  fetchReservationById: (id: number) => Promise<void>
  createReservation: (data: ReservationFormValues) => Promise<number | null>
  updateReservation: (id: number, status: string) => Promise<void>
  cancelReservation: (id: number) => Promise<void>
}

const API_URL = 'http://localhost:5000/api'

export const useReservationStore = create<ReservationState>((set, get) => ({
  reservations: [],
  userReservations: [],
  selectedReservation: null,
  loading: false,
  error: null,

  fetchReservations: async () => {
    set({ loading: true, error: null })

    try {
      const response = await axios.get(`${API_URL}/Reservation`)
      set({ reservations: response.data, loading: false })
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to fetch reservations'
          : 'An unexpected error occurred'

      set({ loading: false, error: errorMessage })
    }
  },

  fetchUserReservations: async () => {
    set({ loading: true, error: null })

    try {
      const response = await axios.get(`${API_URL}/Reservation/user`)
      set({ userReservations: response.data, loading: false })
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to fetch your reservations'
          : 'An unexpected error occurred'

      set({ loading: false, error: errorMessage })
    }
  },

  fetchReservationById: async (id: number) => {
    set({ loading: true, error: null, selectedReservation: null })

    try {
      const response = await axios.get(`${API_URL}/Reservation/${id}`)
      set({ selectedReservation: response.data, loading: false })
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to fetch reservation'
          : 'An unexpected error occurred'

      set({ loading: false, error: errorMessage })
    }
  },

  createReservation: async (data: ReservationFormValues) => {
    set({ loading: true, error: null })

    try {
      const response = await axios.post(`${API_URL}/Reservation`, data)

      // Refresh user reservations
      get().fetchUserReservations()

      set({ loading: false })
      return response.data.id
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to create reservation'
          : 'An unexpected error occurred'

      set({ loading: false, error: errorMessage })
      return null
    }
  },

  updateReservation: async (id: number, status: string) => {
    set({ loading: true, error: null })

    try {
      await axios.patch(`${API_URL}/Reservation/${id}/status`, { status })

      // Update the selected reservation if it's the one being updated
      const { selectedReservation } = get()
      if (selectedReservation && selectedReservation.id === id) {
        set({
          selectedReservation: {
            ...selectedReservation,
            status: status as Reservation['status']
          }
        })
      }

      // Refresh user reservations
      get().fetchUserReservations()

      set({ loading: false })
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to update reservation'
          : 'An unexpected error occurred'

      set({ loading: false, error: errorMessage })
    }
  },

  cancelReservation: async (id: number) => {
    set({ loading: true, error: null })

    try {
      await axios.patch(`${API_URL}/Reservation/${id}/status`, { status: 'Cancelled' })

      // Update the selected reservation if it's the one being cancelled
      const { selectedReservation } = get()
      if (selectedReservation && selectedReservation.id === id) {
        set({
          selectedReservation: {
            ...selectedReservation,
            status: 'Cancelled'
          }
        })
      }

      // Refresh user reservations
      get().fetchUserReservations()

      set({ loading: false })
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to cancel reservation'
          : 'An unexpected error occurred'

      set({ loading: false, error: errorMessage })
    }
  }
}))