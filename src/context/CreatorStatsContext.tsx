// @ts-nocheck
import React, { createContext, useContext, useCallback, useState } from "react";
import Cookies from "js-cookie";

const defaultChannels = ["subscriptions", "tips", "posts", "referrals", "messages", "streams"];

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
  dateRange: "2023-11-30_2023-12-13",
  viewMode: "week",
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

// ======= CALC HELPERS =======

// Fallback distribution when children sum is 0 and total is set
// based on your example: 47.68 => 0.19, 5.65, 41.84
const fallbackBaseDistribution = {
  subscriptions: 0.19,
  tips: 5.65,
  posts: 0,
  referrals: 0,
  messages: 41.84,
  streams: 0,
};
const fallbackBaseTotal = Object.values(fallbackBaseDistribution).reduce(
  (sum, v) => sum + v,
  0
); // 47.68

function calculateRatios(current) {
  const children = defaultChannels.map((channel) => current[channel] || 0);
  const sum = children.reduce((a, b) => a + b, 0);
  return sum === 0
    ? children.map(() => 0)
    : children.map((v) => v / sum);
}

function recalcChildrenFromTotal(channels, newTotal) {
  const childrenSum = defaultChannels.reduce((sum, c) => sum + (channels[c] || 0), 0);
  const newChannels = { ...channels };

  if (newTotal <= 0) {
    // If total is 0 or negative, just zero everything
    defaultChannels.forEach((ch) => {
      newChannels[ch] = 0;
    });
    newChannels.total = 0;
    return newChannels;
  }

  if (childrenSum === 0) {
    // No existing distribution: use fallback distribution
    if (fallbackBaseTotal > 0) {
      defaultChannels.forEach((ch) => {
        const base = fallbackBaseDistribution[ch] || 0;
        const ratio = base / fallbackBaseTotal;
        newChannels[ch] = Number((newTotal * ratio).toFixed(2));
      });
    } else {
      // If fallback is somehow zero, just put everything into messages
      defaultChannels.forEach((ch) => {
        newChannels[ch] = ch === "messages" ? Number(newTotal.toFixed(2)) : 0;
      });
    }
  } else {
    // We have an existing distribution: preserve ratios
    const ratios = calculateRatios(channels);
    ratios.forEach((ratio, idx) => {
      const channel = defaultChannels[idx];
      newChannels[channel] = Number((newTotal * ratio).toFixed(2));
    });
  }

  newChannels.total = Number(newTotal.toFixed(2));
  return newChannels;
}

function recalcTotalFromChildren(channels) {
  const total = defaultChannels.reduce((sum, c) => sum + (channels[c] || 0), 0);
  return { ...channels, total: Number(total.toFixed(2)) };
}

// ======= PROVIDER =======

export const CreatorStatsProvider = ({ children }) => {
  // Initial load from cookie or start with defaults:
  const [filters, setFilters] = useState(() => {
    const cookieRaw = Cookies.get(COOKIE_KEY);
    if (cookieRaw) {
      try {
        const parsed = JSON.parse(cookieRaw);
        return parsed.filters || { ...defaultFilters };
      } catch {
        return { ...defaultFilters };
      }
    }
    return { ...defaultFilters };
  });

  const [statsByFilter, setStatsByFilter] = useState(() => {
    const cookieRaw = Cookies.get(COOKIE_KEY);
    if (cookieRaw) {
      try {
        const parsed = JSON.parse(cookieRaw);
        const loadedFilters = parsed.filters || defaultFilters;
        const initialFKey = `${loadedFilters.dateRange}:${loadedFilters.viewMode}`;
        return {
          ...(parsed.statsByFilter || {}),
          [initialFKey]:
          (parsed.statsByFilter && parsed.statsByFilter[initialFKey]) ||
          { ...defaultStats },
        };
      } catch {
        const initialFKey = `${defaultFilters.dateRange}:${defaultFilters.viewMode}`;
        return { [initialFKey]: { ...defaultStats } };
      }
    } else {
      const initialFKey = `${defaultFilters.dateRange}:${defaultFilters.viewMode}`;
      return { [initialFKey]: { ...defaultStats } };
    }
  });

  function persistCookie(newStatsByFilter, newFilters) {
    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({ statsByFilter: newStatsByFilter, filters: newFilters }),
      { expires: 365 }
    );
  }

  const filterKey = `${filters.dateRange}:${filters.viewMode}`;

  const setDateRange = useCallback(
    (range) => {
      setFilters((f) => {
        const newFilters = { ...f, dateRange: range };
        setStatsByFilter((prevStats) => {
          const newKey = `${range}:${newFilters.viewMode}`;
          const updated = {
            ...prevStats,
            [newKey]: prevStats[newKey] ?? { ...defaultStats },
          };
          persistCookie(updated, newFilters);
          return updated;
        });
        return newFilters;
      });
    },
    []
  );

  const setViewMode = useCallback(
    (mode) => {
      setFilters((f) => {
        const newFilters = { ...f, viewMode: mode };
        setStatsByFilter((prevStats) => {
          const newKey = `${newFilters.dateRange}:${mode}`;
          const updated = {
            ...prevStats,
            [newKey]: prevStats[newKey] ?? { ...defaultStats },
          };
          persistCookie(updated, newFilters);
          return updated;
        });
        return newFilters;
      });
    },
    []
  );

  const updateTotalEarnings = useCallback(
    (value) => {
      setStatsByFilter((prev) => {
        const existing = prev[filterKey] ?? { ...defaultStats };
        const updated = {
          ...prev,
          [filterKey]: recalcChildrenFromTotal(existing, value),
        };
        persistCookie(updated, filters);
        return updated;
      });
    },
    [filterKey, filters]
  );

  const updateChannelValue = useCallback(
    (channel, value) => {
      if (!defaultChannels.includes(channel)) return;
      setStatsByFilter((prev) => {
        const existing = prev[filterKey] ?? { ...defaultStats };
        const newChannels = { ...existing };
        newChannels[channel] = Number(value.toFixed(2));
        const updated = {
          ...prev,
          [filterKey]: recalcTotalFromChildren(newChannels),
        };
        persistCookie(updated, filters);
        return updated;
      });
    },
    [filterKey, filters]
  );

  const resetStats = useCallback(() => {
    setStatsByFilter((prev) => {
      const updated = { ...prev, [filterKey]: { ...defaultStats } };
      persistCookie(updated, filters);
      return updated;
    });
  }, [filterKey, filters]);

  const stats = statsByFilter[filterKey] ?? { ...defaultStats };

  const ctx = {
    stats,
    filters,
    updateTotalEarnings,
    updateChannelValue,
    setDateRange,
    setViewMode,
    resetStats,
  };

  return (
    <CreatorStatsContext.Provider value={ctx}>
      {children}
    </CreatorStatsContext.Provider>
  );
};
