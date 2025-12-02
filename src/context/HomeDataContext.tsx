import React, { createContext, useContext, useState } from "react";

export interface HomeData {
  totalEarnings: number;
  dayBeforePercent: number;
  payoutPercent: number;
  failedPaymentsPercent: number;
  linkPaymentsPercent: number;
  refundsPercent: number;
  usdBalance: number;
  payoutsTotal: number;
  grossVolume: number;
  paymentsSucceeded: number;
  paymentsRefunded: number;
  paymentsFailed: number;
  topCard: number;
  topLink: number;
  chartA: (number | null)[];
  chartB: (number | null)[];
  storeName: string;
  currencySign: string;
}

interface HomeDataContextType {
  data: HomeData;
  updateField: (key: keyof HomeData, value: any) => void;
  updateMultiple: (values: Partial<HomeData>) => void;
  resetToDefaults: () => void;
}

const DEFAULT_DATA: HomeData = {
  totalEarnings: 140349.0,
  dayBeforePercent: 10,
  payoutPercent: 10,
  failedPaymentsPercent: 4,
  linkPaymentsPercent: 0,
  refundsPercent: 0,
  usdBalance: 4519.24,
  payoutsTotal: 14034.9,
  grossVolume: 140349.0,
  paymentsSucceeded: 140349.0,
  paymentsRefunded: 0,
  paymentsFailed: 5613.96,
  topCard: 140349.0,
  topLink: 0,
  chartA: Array(25).fill(null),
  chartB: Array(25).fill(null),
  storeName: "DASHNAMEHERE",
  currencySign: "$",
};

// ----- Cookie helpers -----
const COOKIE_NAME = "homeData";

function setCookie(value: HomeData) {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(value)
  )}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

function getCookie(): HomeData | null {
  const match = document.cookie.match(new RegExp("(^| )" + COOKIE_NAME + "=([^;]+)"));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[2]));
  } catch {
    return null;
  }
}

// ----- Context -----
const HomeDataContext = createContext<HomeDataContextType | null>(null);

export const useHomeData = () => {
  const ctx = useContext(HomeDataContext);
  if (!ctx) throw new Error("useHomeData must be used inside provider");
  return ctx;
};

// ----- Provider -----
export const HomeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load cookie synchronously on initialization
  const saved = getCookie();
  const [data, setData] = useState<HomeData>({ ...DEFAULT_DATA, ...saved });

  const persist = (newData: HomeData) => {
    setData(newData);
    setCookie(newData); // write immediately
  };

  const updateField = (key: keyof HomeData, value: any) => {
    persist({ ...data, [key]: value });
  };

  const updateMultiple = (values: Partial<HomeData>) => {
    persist({ ...data, ...values });
  };

  const resetToDefaults = () => {
    persist(DEFAULT_DATA);
  };

  return (
    <HomeDataContext.Provider value={{ data, updateField, updateMultiple, resetToDefaults }}>
      {children}
    </HomeDataContext.Provider>
  );
};
