import { create } from 'zustand'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true })
    try {
      set({ notifications: [] })
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      set({ loading: false })
    }
  },

  fetchUnreadCount: async () => {
    try {
      set({ unreadCount: 0 })
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  },

  markAsRead: async (id) => {
    try {
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
      const notifications = get().notifications.map(n => ({ ...n, is_read: true }))
      set({ notifications, unreadCount: 0 })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }
}))