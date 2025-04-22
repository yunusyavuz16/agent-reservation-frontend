import { create } from 'zustand'
import axios from 'axios'
import { Review, ReviewFormValues } from '../types'

interface ReviewState {
  reviews: Review[]
  resourceReviews: Review[]
  userReviews: Review[]
  loading: boolean
  error: string | null

  fetchReviews: () => Promise<void>
  fetchResourceReviews: (resourceId: number) => Promise<void>
  fetchUserReviews: () => Promise<void>
  submitReview: (data: ReviewFormValues) => Promise<void>
  updateReview: (id: number, data: { rating: number, comment: string }) => Promise<void>
  deleteReview: (id: number) => Promise<void>
}

const API_URL = 'http://localhost:5000/api'

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  resourceReviews: [],
  userReviews: [],
  loading: false,
  error: null,

  fetchReviews: async () => {
    set({ loading: true, error: null })

    try {
      const response = await axios.get(`${API_URL}/Review`)
      set({ reviews: response.data, loading: false })
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to fetch reviews'
          : 'An unexpected error occurred'

      set({ loading: false, error: errorMessage })
    }
  },

  fetchResourceReviews: async (resourceId: number) => {
    set({ loading: true, error: null })

    try {
      const response = await axios.get(`${API_URL}/Review/Resource/${resourceId}`)
      set({ resourceReviews: response.data, loading: false })
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to fetch resource reviews'
          : 'An unexpected error occurred'

      set({ loading: false, error: errorMessage })
    }
  },

  fetchUserReviews: async () => {
    set({ loading: true, error: null })

    try {
      // Assuming an endpoint exists to get user's reviews
      const response = await axios.get(`${API_URL}/Review/User`)
      set({ userReviews: response.data, loading: false })
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to fetch your reviews'
          : 'An unexpected error occurred'

      set({ loading: false, error: errorMessage })
    }
  },

  submitReview: async (data: ReviewFormValues) => {
    set({ loading: true, error: null })

    try {
      await axios.post(`${API_URL}/Review`, data)
      set({ loading: false })

      // If this is a review for a resource we're currently viewing, refresh resource reviews
      const { resourceReviews } = get()
      if (resourceReviews.length > 0) {
        const resourceId = resourceReviews[0].resourceId
        if (resourceId) {
          get().fetchResourceReviews(resourceId)
        }
      }
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to submit review'
          : 'An unexpected error occurred'

      set({ loading: false, error: errorMessage })
    }
  },

  updateReview: async (id: number, data: { rating: number, comment: string }) => {
    set({ loading: true, error: null })

    try {
      await axios.put(`${API_URL}/Review/${id}`, data)

      // Update local state without refetching from server
      const updateReviewInList = (reviews: Review[]): Review[] =>
        reviews.map(review =>
          review.id === id
            ? { ...review, ...data, updatedAt: new Date().toISOString() }
            : review
        )

      const { reviews, resourceReviews, userReviews } = get()

      set({
        reviews: updateReviewInList(reviews),
        resourceReviews: updateReviewInList(resourceReviews),
        userReviews: updateReviewInList(userReviews),
        loading: false
      })
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to update review'
          : 'An unexpected error occurred'

      set({ loading: false, error: errorMessage })
    }
  },

  deleteReview: async (id: number) => {
    set({ loading: true, error: null })

    try {
      await axios.delete(`${API_URL}/Review/${id}`)

      // Update local state without refetching from server
      const removeReviewFromList = (reviews: Review[]): Review[] =>
        reviews.filter(review => review.id !== id)

      const { reviews, resourceReviews, userReviews } = get()

      set({
        reviews: removeReviewFromList(reviews),
        resourceReviews: removeReviewFromList(resourceReviews),
        userReviews: removeReviewFromList(userReviews),
        loading: false
      })
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to delete review'
          : 'An unexpected error occurred'

      set({ loading: false, error: errorMessage })
    }
  }
}))