// @ts-nocheck
import React, { createContext, useContext, useEffect, useCallback, useState } from "react";
import Cookies from "js-cookie";

const defaultChannels = ["subscriptions", "tips", "posts", "referrals", "messages", "streams"];

// Default values
const defaultStats = {
  total: 0,
  subscriptions: 0,
  tips: 0,
  posts: 0,
  referrals: 0,
  messages: 0,
  streams: 0,
};

const defaultFilters = {
  dateRange: "2023-11-30_2023-12-13", // as an example, format: YYYY-MM-DD_YYYY-MM-DD
  viewMode: "week", // can be "day" or "week"
};

const COOKIE_KEY = "creatorStats";

const CreatorStatsContext = createContext({
  stats: { ...defaultStats },
  filters: { ...defaultFilters },
  updateTotalEarnings: (value: number) => {},
  updateChannelValue: (channel: string, value: number) => {},
  setDateRange: (range: string) => {},
  setViewMode: (mode: "day" | "week") => {},
  resetStats: () => {},
});

export const useCreatorStats = () => useContext(CreatorStatsContext);

function calculateRatios(current: typeof defaultStats) {
  const children = defaultChannels.map((channel) => current[channel]);
  const sum = children.reduce((a, b) => a + b, 0);
  return sum === 0
    ? children.map(() => 0)
    : children.map((v) => v / sum);
}

function recalcChildrenFromTotal(channels: typeof defaultStats, newTotal: number) {
  // Recalculate child values preserving their ratios
  const ratios = calculateRatios(channels);
  const newChannels = { ...channels };
  ratios.forEach((ratio, idx) => {
    const channel = defaultChannels[idx];
    newChannels[channel] = Number((newTotal * ratio).toFixed(2));
  });
  newChannels.total = Number(newTotal.toFixed(2));
  return newChannels;
}

function recalcTotalFromChildren(channels: typeof defaultStats) {
  const total =
    defaultChannels.reduce((sum, c) => sum + (channels[c] || 0), 0);
  return { ...channels, total: Number(total.toFixed(2)) };
}

export const CreatorStatsProvider: React.FC<{ children: any }> = ({ children }) => {
  // Structure: { [filterKey]: { stats } }
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [statsByFilter, setStatsByFilter] = useState<{ [filterKey: string]: typeof defaultStats }>({});

  // Utility: filterKey
  const filterKey = `${filters.dateRange}:${filters.viewMode}`;

  // Load from cookie
  useEffect(() => {
    const cookieRaw = Cookies.get(COOKIE_KEY);
    if (cookieRaw) {
      try {
        const parsed = JSON.parse(cookieRaw);
        setStatsByFilter(parsed.statsByFilter ?? {});
        setFilters(parsed.filters ?? defaultFilters);
      } catch (e) {
        // Cookie corrupted
        setStatsByFilter({});
        setFilters(defaultFilters);
      }
    } else {
      // First visit: initialize
      setStatsByFilter({
        [filterKey]: { ...defaultStats },
      });
      setFilters(defaultFilters);
    }
    // eslint-disable-next-line
  }, []);

  // Persist to cookie whenever stats or filters change
  useEffect(() => {
    Cookies.set(COOKIE_KEY, JSON.stringify({ statsByFilter, filters }), { expires: 365 });
  }, [statsByFilter, filters]);

  // Current stats slice
  const stats = statsByFilter[filterKey] ?? { ...defaultStats };

  // --- Updaters ---
  const setDateRange = useCallback((range: string) => {
    setFilters((f) => {
      const newFilters = { ...f, dateRange: range };
      const newKey = `${range}:${f.viewMode}`;
      setStatsByFilter((statsByFilter) => ({
        ...statsByFilter,
        [newKey]: statsByFilter[newKey] ?? { ...defaultStats },
      }));
      return newFilters;
    });
  }, []);

  const setViewMode = useCallback((mode: "day" | "week") => {
    setFilters((f) => {
      const newFilters = { ...f, viewMode: mode };
      const newKey = `${f.dateRange}:${mode}`;
      setStatsByFilter((statsByFilter) => ({
        ...statsByFilter,
        [newKey]: statsByFilter[newKey] ?? { ...defaultStats },
      }));
      return newFilters;
    });
  }, []);

  const updateTotalEarnings = useCallback((value: number) => {
    setStatsByFilter((prev) => ({
      ...prev,
      [filterKey]: recalcChildrenFromTotal(prev[filterKey] ?? defaultStats, value),
    }));
  }, [filterKey]);

  const updateChannelValue = useCallback((channel: string, value: number) => {
    if (!defaultChannels.includes(channel)) return;
    setStatsByFilter((prev) => {
      const newChannels = { ...(prev[filterKey] ?? defaultStats) };
      newChannels[channel] = Number(value.toFixed(2));
      // recalc total
      return {
        ...prev,
        [filterKey]: recalcTotalFromChildren(newChannels),
      };
    });
  }, [filterKey]);

  const resetStats = useCallback(() => {
    setStatsByFilter((prev) => ({
      ...prev,
      [filterKey]: { ...defaultStats },
    }));
  }, [filterKey]);

  // --- Context Value ---
  const value = {
    stats,
    filters,
    updateTotalEarnings,
    updateChannelValue,
    setDateRange,
    setViewMode,
    resetStats
  };

  return (
    <CreatorStatsContext.Provider value={value}>
      {children}
    </CreatorStatsContext.Provider>
  );
};
