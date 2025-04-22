import { create } from 'zustand'
import axios from 'axios'
import { Payment, PaymentFormValues } from '../types'

interface PaymentState {
  payments: Payment[]
  selectedPayment: Payment | null
  loading: boolean
  error: string | null

  fetchPayments: () => Promise<void>
  fetchPaymentById: (id: number) => Promise<void>
  processPayment: (data: PaymentFormValues) => Promise<number | null>
}

const API_URL = 'http://localhost:5000/api'

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  selectedPayment: null,
  loading: false,
  error: null,

  fetchPayments: async () => {
    set({ loading: true, error: null })

    try {
      const response = await axios.get(`${API_URL}/Payment`)
      set({ payments: response.data, loading: false })
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to fetch payments'
          : 'An unexpected error occurred'

      set({ loading: false, error: errorMessage })
    }
  },

  fetchPaymentById: async (id: number) => {
    set({ loading: true, error: null, selectedPayment: null })

    try {
      const response = await axios.get(`${API_URL}/Payment/${id}`)
      set({ selectedPayment: response.data, loading: false })
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to fetch payment'
          : 'An unexpected error occurred'

      set({ loading: false, error: errorMessage })
    }
  },

  processPayment: async (data: PaymentFormValues) => {
    set({ loading: true, error: null })

    try {
      const response = await axios.post(`${API_URL}/Payment`, data)

      set({
        loading: false,
        // Add the new payment to our payments array
        payments: [response.data, ...get().payments]
      })

      return response.data.id
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Payment processing failed'
          : 'An unexpected error occurred'

      set({ loading: false, error: errorMessage })
      return null
    }
  }
}))