import api from './api';

export const paymentMethodService = {
  // Get all active payment methods (public)
  getAll: () => api.get('/payment-methods'),
  
  // Get single payment method by ID (public)
  getById: (id) => api.get(`/payment-methods/${id}`),
  
  // Admin: Get all payment methods (including inactive)
  getAllAdmin: () => api.get('/payment-methods/admin'),
  
  // Admin: Get payment method by ID
  getByIdAdmin: (id) => api.get(`/payment-methods/admin/${id}`),
  
  // Admin: Create payment method
  create: (data) => api.post('/payment-methods/admin', data),
  
  // Admin: Update payment method
  update: (id, data) => api.put(`/payment-methods/admin/${id}`, data),
  
  // Admin: Delete payment method
  delete: (id) => api.delete(`/payment-methods/admin/${id}`),
  
  // Get payment methods for a property
  getForProperty: (propertyId) => api.get(`/payment-methods/property/${propertyId}`),
  
  // Update payment methods for a property
  updateForProperty: (propertyId, paymentMethodIds) => 
    api.put(`/payment-methods/property/${propertyId}`, { payment_method_ids: paymentMethodIds }),
};
