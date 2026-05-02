import api from './api';

export const propertyService = {
  getProperties: (params) => api.get('/properties', { params }),
  getFeaturedProperties: () => api.get('/properties/featured'),
  getPropertyById: (id) => api.get(`/properties/${id}`),
  getPropertyTypes: () => api.get('/properties/types'),
  getLocations: () => api.get('/properties/locations'),
  createProperty: (data) => api.post('/properties', data),
  updateProperty: (id, data) => api.put(`/properties/${id}`, data),
  deleteProperty: (id) => api.delete(`/properties/${id}`),
};
