import { create } from 'zustand'
import { notificationService } from '../services/notificationService'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true })
    try {
      const response = await notificationService.getAll()
      const notifications = response.data || []
      const unreadCount = notifications.filter(n => !n.is_read).length
      set({ notifications, unreadCount })
    } catch (error) {
      console.error('Error fetching notifications:', error)
      set({ notifications: [], unreadCount: 0 })
    } finally {
      set({ loading: false })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationService.getUnreadCount()
      set({ unreadCount: response.data.count || 0 })
    } catch (error) {
      console.error('Error fetching unread count:', error)
      set({ unreadCount: 0 })
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationService.markAsRead(id)
      const notifications = get().notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      )
      const unreadCount = notifications.filter(n => !n.is_read).length
      set({ notifications, unreadCount })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead()
      const notifications = get().notifications.map(n => ({ ...n, is_read: true }))
      set({ notifications, unreadCount: 0 })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }
}))