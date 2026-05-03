import api from './api';

const API = '/api/payment-methods';

export const paymentMethodService = {
  getAll: () => api.get(API),
  getById: (id) => api.get(`${API}/${id}`),
  getAllAdmin: () => api.get(`${API}/admin`),
  getByIdAdmin: (id) => api.get(`${API}/admin/${id}`),
  create: (data) => api.post(`${API}/admin`, data),
  update: (id, data) => api.put(`${API}/admin/${id}`, data),
  delete: (id) => api.delete(`${API}/admin/${id}`),
  getForProperty: (propertyId) => api.get(`${API}/property/${propertyId}`),
  updateForProperty: (propertyId, paymentMethodIds) => 
    api.put(`${API}/property/${propertyId}`, { payment_method_ids: paymentMethodIds }),
};
