import { create } from 'zustand'
import axios from 'axios'
import { Notification } from '../types'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null

  fetchNotifications: () => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const API_URL = 'http://localhost:5000/api'

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null })

    try {
      const response = await axios.get(`${API_URL}/Notification`)
      set({ notifications: response.data, loading: false })
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to fetch notifications'
          : 'An unexpected error occurred'

      set({ loading: false, error: errorMessage })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await axios.get(`${API_URL}/Notification/unread`)
      set({ unreadCount: response.data.length })
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
      // Don't set error state here to avoid UI disruption
    }
  },

  markAsRead: async (id: number) => {
    try {
      await axios.put(`${API_URL}/Notification/${id}/read`)

      // Update local state without refetching from server
      const { notifications, unreadCount } = get()
      const updatedNotifications = notifications.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )

      const newUnreadCount = unreadCount > 0 ? unreadCount - 1 : 0

      set({
        notifications: updatedNotifications,
        unreadCount: newUnreadCount
      })
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to mark notification as read'
          : 'An unexpected error occurred'

      set({ error: errorMessage })
    }
  },

  markAllAsRead: async () => {
    set({ loading: true, error: null })

    try {
      await axios.put(`${API_URL}/Notification/markAllRead`)

      // Update local state without refetching from server
      const { notifications } = get()
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        isRead: true
      }))

      set({
        notifications: updatedNotifications,
        unreadCount: 0,
        loading: false
      })
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to mark all notifications as read'
          : 'An unexpected error occurred'

      set({ loading: false, error: errorMessage })
    }
  }
}))