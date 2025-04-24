import { create } from 'zustand'
import axios, { AxiosError } from 'axios'
import api from '../utils/api'
import { Reservation, ReservationFormValues, CreateReservationFormValues } from '../types'

interface ApiErrorResponse {
  message?: string;
  [key: string]: any;
}

interface ReservationState {
  reservations: Reservation[]
  userReservations: Reservation[]
  upcomingReservations: Reservation[]
  selectedReservation: Reservation | null
  loading: boolean
  error: string | null

  fetchReservations: () => Promise<void>
  fetchUserReservations: () => Promise<void>
  fetchUpcomingReservations: () => Promise<void>
  fetchReservationById: (id: number) => Promise<void>
  createReservation: (data: CreateReservationFormValues) => Promise<number | null>
  updateReservation: (id: number, status: string) => Promise<void>
  cancelReservation: (id: number) => Promise<void>
  checkAvailability: (startDate: Date, endDate: Date, resourceId?: number) => Promise<any[]>
}

export const useReservationStore = create<ReservationState>((set, get) => ({
  reservations: [],
  userReservations: [],
  upcomingReservations: [],
  selectedReservation: null,
  loading: false,
  error: null,

  fetchReservations: async () => {
    set({ loading: true, error: null })

    try {
      const response = await api.get('/Reservation')
      set({ reservations: response.data, loading: false })
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      const errorMessage = error.response?.data?.message || 'Failed to fetch reservations'
      set({ loading: false, error: errorMessage })
    }
  },

  fetchUserReservations: async () => {
    set({ loading: true, error: null })

    try {
      const response = await api.get('/Reservation')
      set({ userReservations: response.data, loading: false })
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      const errorMessage = error.response?.data?.message || 'Failed to fetch your reservations'
      set({ loading: false, error: errorMessage })
    }
  },

  fetchUpcomingReservations: async () => {
    set({ loading: true, error: null })

    try {
      const response = await api.get('/Reservation/upcoming')
      set({ upcomingReservations: response.data, loading: false })
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      const errorMessage = error.response?.data?.message || 'Failed to fetch upcoming reservations'
      set({ loading: false, error: errorMessage })
    }
  },

  fetchReservationById: async (id: number) => {
    set({ loading: true, error: null, selectedReservation: null })

    try {
      const response = await api.get(`/Reservation/${id}`)
      set({ selectedReservation: response.data, loading: false })
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      const errorMessage = error.response?.data?.message || 'Failed to fetch reservation'
      set({ loading: false, error: errorMessage })
    }
  },

  createReservation: async (data: CreateReservationFormValues) => {
    set({ loading: true, error: null })

    try {
      const formattedData = {
        ...data,
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString(),
        recurrenceEndDate: data.isRecurring && data.recurrenceEndDate
          ? data.recurrenceEndDate.toISOString()
          : undefined
      }

      const response = await api.post('/Reservation', formattedData)

      // Refresh user reservations
      get().fetchUserReservations()

      set({ loading: false })
      return response.data.id
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      const errorMessage = error.response?.data?.message || 'Failed to create reservation'
      set({ loading: false, error: errorMessage })
      return null
    }
  },

  updateReservation: async (id: number, status: string) => {
    set({ loading: true, error: null })

    try {
      await api.patch(`/Reservation/${id}/status`, { status })

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
      const error = err as AxiosError<ApiErrorResponse>
      const errorMessage = error.response?.data?.message || 'Failed to update reservation'
      set({ loading: false, error: errorMessage })
    }
  },

  cancelReservation: async (id: number) => {
    set({ loading: true, error: null })

    try {
      await api.patch(`/Reservation/${id}/status`, { status: 'Cancelled' })

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
      const error = err as AxiosError<ApiErrorResponse>
      const errorMessage = error.response?.data?.message || 'Failed to cancel reservation'
      set({ loading: false, error: errorMessage })
    }
  },

  checkAvailability: async (startDate: Date, endDate: Date, resourceId?: number) => {
    set({ loading: true, error: null })

    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })

      if (resourceId) {
        params.append('resourceId', resourceId.toString())
      }

      const response = await api.get(`/Reservation/availability?${params}`)
      set({ loading: false })
      return response.data
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      const errorMessage = error.response?.data?.message || 'Failed to check availability'
      set({ loading: false, error: errorMessage })
      return []
    }
  }
}))