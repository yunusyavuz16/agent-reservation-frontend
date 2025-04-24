import { create } from 'zustand'
import api from '../utils/api'
import { Payment, PaymentFormValues } from '../types'

interface PaymentState {
  payments: Payment[]
  selectedPayment: Payment | null
  loading: boolean
  error: string | null

  fetchPayments: () => Promise<void>
  fetchPaymentById: (id: number) => Promise<void>
  processPayment: (data: PaymentFormValues) => Promise<void>
  refundPayment: (id: number) => Promise<void>
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  selectedPayment: null,
  loading: false,
  error: null,

  fetchPayments: async () => {
    set({ loading: true, error: null })

    try {
      const response = await api.get('/Payment')
      set({ payments: response.data, loading: false })
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch payments'

      set({ loading: false, error: errorMessage })
    }
  },

  fetchPaymentById: async (id: number) => {
    set({ loading: true, error: null, selectedPayment: null })

    try {
      const response = await api.get(`/Payment/${id}`)
      set({ selectedPayment: response.data, loading: false })
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch payment'

      set({ loading: false, error: errorMessage })
    }
  },

  processPayment: async (data: PaymentFormValues) => {
    set({ loading: true, error: null })

    try {
      await api.post('/Payment', data)
      set({ loading: false })
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to process payment'

      set({ loading: false, error: errorMessage })
      throw new Error(errorMessage) // Re-throw for component handling
    }
  },

  refundPayment: async (id: number) => {
    set({ loading: true, error: null })

    try {
      await api.post(`/Payment/${id}/refund`)
      set({ loading: false })
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to refund payment'

      set({ loading: false, error: errorMessage })
    }
  }
}))