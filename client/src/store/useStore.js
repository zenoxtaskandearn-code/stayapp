import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      login: (userData, token) => {
        localStorage.setItem('token', token);
        set({
          user: userData,
          token,
          isAuthenticated: true,
          isAdmin: userData?.role === 'admin',
        });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },

      checkAuth: () => {
        const token = localStorage.getItem('token');
        if (token) {
          return true;
        }
        return false;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const usePropertyStore = create((set) => ({
  properties: [],
  featuredProperties: [],
  currentProperty: null,
  loading: false,
  filters: {
    search: '',
    location: '',
    type: '',
    minPrice: '',
    maxPrice: '',
  },

  setProperties: (properties) => set({ properties }),
  setFeaturedProperties: (properties) => set({ featuredProperties: properties }),
  setCurrentProperty: (property) => set({ currentProperty: property }),
  setLoading: (loading) => set({ loading }),
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
}));

export const useBookingStore = create((set) => ({
  bookings: [],
  currentBooking: null,
  loading: false,

  setBookings: (bookings) => set({ bookings }),
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  setLoading: (loading) => set({ loading }),
}));

export const useCurrencyStore = create(
  persist(
    (set, get) => ({
      currency: 'GBP',
      symbol: '£',

      setCurrency: (curr) => {
        const symbols = { GBP: '£', USD: '$', EUR: '€' };
        set({ currency: curr, symbol: symbols[curr] || '£' });
      },
    }),
    {
      name: 'currency-storage',
    }
  )
);
