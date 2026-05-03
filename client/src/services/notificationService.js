import api from './api';

const API = '/notifications';

export const notificationService = {
  getAll: () => api.get(API),
  getUnreadCount: () => api.get(`${API}/unread-count`),
  markAsRead: (id) => api.put(`${API}/${id}/read`),
  markAllAsRead: () => api.put(`${API}/mark-all-read`),
};