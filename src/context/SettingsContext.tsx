// src/context/SettingsContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

interface SettingsContextProps {
  totalEarnings: number;
  setTotalEarnings: (value: number) => void;
  tablePercentages: number[];
  currencySign: string;
  setCurrencySign: (value: string) => void;
}

const SettingsContext = createContext<SettingsContextProps | null>(null);

export const TABLE_PERCENTAGES = [
  0.275839,
  0.330445,
  0.393563,
  0.281796,
  0.301407,
  0.240884,
  0.109096,
  0.066715,
];

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [totalEarnings, setTotalEarningsState] = useState<number>(98939.52);
  const [currencySign, setCurrencySignState] = useState<string>("$");

  // Load from cookies at startup
  useEffect(() => {
    const totalCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("total_earnings="));
    if (totalCookie) {
      const parsed = parseFloat(totalCookie.split("=")[1]);
      if (!isNaN(parsed)) setTotalEarningsState(parsed);
    }

    const currencyCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("currency_sign="));
    if (currencyCookie) {
      setCurrencySignState(currencyCookie.split("=")[1]);
    }
  }, []);

  // Save to cookies
  const setTotalEarnings = (val: number) => {
    setTotalEarningsState(val);
    document.cookie = `total_earnings=${val}; path=/; max-age=31536000`; // 1 year
  };

  const setCurrencySign = (val: string) => {
    setCurrencySignState(val);
    document.cookie = `currency_sign=${val}; path=/; max-age=31536000`; // 1 year
  };

  return (
    <SettingsContext.Provider
      value={{
        totalEarnings,
        setTotalEarnings,
        tablePercentages: TABLE_PERCENTAGES,
        currencySign,
        setCurrencySign,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
};
