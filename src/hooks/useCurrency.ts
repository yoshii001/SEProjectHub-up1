import { useState, useEffect } from 'react';

interface CurrencySettings {
  currency: 'USD' | 'LKR' | 'EUR' | 'GBP';
  symbol: string;
  rate: number;
}

const CURRENCY_SYMBOLS = {
  USD: '$',
  LKR: 'Rs.',
  EUR: '€',
  GBP: '£'
};

// Mock exchange rates - in a real app, fetch from an API
const EXCHANGE_RATES = {
  USD: 1,
  LKR: 325.50,
  EUR: 0.85,
  GBP: 0.73
};

export const useCurrency = () => {
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(() => {
    const saved = localStorage.getItem('currency-settings');
    return saved ? JSON.parse(saved) : {
      currency: 'USD',
      symbol: '$',
      rate: 1
    };
  });

  useEffect(() => {
    localStorage.setItem('currency-settings', JSON.stringify(currencySettings));
  }, [currencySettings]);

  const updateCurrency = (currency: 'USD' | 'LKR' | 'EUR' | 'GBP') => {
    setCurrencySettings({
      currency,
      symbol: CURRENCY_SYMBOLS[currency],
      rate: EXCHANGE_RATES[currency]
    });
  };

  const formatCurrency = (amount: number, showSymbol = true) => {
    const convertedAmount = amount * currencySettings.rate;
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(convertedAmount);
    
    return showSymbol ? `${currencySettings.symbol}${formatted}` : formatted;
  };

  return {
    currencySettings,
    updateCurrency,
    formatCurrency
  };
};