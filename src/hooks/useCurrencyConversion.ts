import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
];

interface CurrencyStore {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      selectedCurrency: CURRENCIES[0], // USD default
      setSelectedCurrency: (currency) => set({ selectedCurrency: currency }),
    }),
    {
      name: "currency-storage",
    }
  )
);

export const useExchangeRates = () => {
  return useQuery({
    queryKey: ["exchange-rates"],
    queryFn: async () => {
      // Using exchangerate-api.com free tier (1,500 requests/month)
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      if (!response.ok) throw new Error("Failed to fetch exchange rates");
      const data = await response.json();
      return data.rates as Record<string, number>;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
  });
};

export const useCurrencyConversion = () => {
  const { selectedCurrency } = useCurrencyStore();
  const { data: rates, isLoading } = useExchangeRates();

  const convertPrice = (usdPrice: number, targetCurrency?: string): string => {
    const currency = targetCurrency || selectedCurrency.code;
    
    if (!rates || isLoading) return `${selectedCurrency.symbol}${usdPrice.toFixed(2)}`;
    
    const rate = rates[currency] || 1;
    const convertedPrice = usdPrice * rate;
    
    // Format based on currency
    if (currency === "JPY" || currency === "CNY" || currency === "INR") {
      // No decimals for these currencies
      return `${CURRENCIES.find(c => c.code === currency)?.symbol || "$"}${Math.round(convertedPrice).toLocaleString()}`;
    }
    
    return `${CURRENCIES.find(c => c.code === currency)?.symbol || "$"}${convertedPrice.toFixed(2)}`;
  };

  const getSymbol = (currencyCode?: string): string => {
    const code = currencyCode || selectedCurrency.code;
    return CURRENCIES.find(c => c.code === code)?.symbol || "$";
  };

  return {
    selectedCurrency,
    convertPrice,
    getSymbol,
    rates,
    isLoading,
  };
};
