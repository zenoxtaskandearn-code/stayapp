import { create } from 'zustand';

export const useSettingsStore = create((set, get) => ({
  currency: 'USD',
  symbol: '$',
  loading: true,
  
  setCurrency: (currency) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£' };
    set({ 
      currency, 
      symbol: symbols[currency] || '$' 
    });
  },
  
  setLoading: (loading) => set({ loading }),
  
  formatPrice: (amount) => {
    const { symbol } = get();
    return `${symbol}${(parseFloat(amount) || 0).toLocaleString()}`;
  },
}));

export default useSettingsStore;