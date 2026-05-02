import { useCurrencyStore } from '../store/useStore';

export const formatPrice = (price) => {
  const { symbol } = useCurrencyStore.getState();
  if (!price) return `${symbol}0`;
  return `${symbol}${parseFloat(price).toLocaleString()}`;
};

export const getCurrencySymbol = () => {
  const { symbol } = useCurrencyStore.getState();
  return symbol;
};

export const currencies = [
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
];