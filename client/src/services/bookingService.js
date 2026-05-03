import api from './api';

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: (userId) => api.get('/bookings/my', { params: { user_id: userId } }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  getAllBookings: () => api.get('/bookings'),
  updateBookingStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  updateBooking: (id, data) => api.put(`/bookings/${id}`, data),
  deleteBooking: (id) => api.delete(`/bookings/${id}`),
};