import { useSettingsStore } from '../store/settingsStore';

export const usePriceFormat = () => {
  const { symbol } = useSettingsStore();
  
  const formatPrice = (amount) => {
    return `${symbol}${(parseFloat(amount) || 0).toLocaleString()}`;
  };
  
  return { formatPrice, symbol };
};

export default usePriceFormat;