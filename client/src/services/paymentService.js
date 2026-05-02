import api from './api';

export const paymentService = {
  uploadScreenshot: (bookingId, formData) =>
    api.post(`/payments/${bookingId}/screenshot`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  verifyPayment: (id) => api.put(`/payments/${id}/verify`),
};
