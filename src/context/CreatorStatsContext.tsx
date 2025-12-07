// @ts-nocheck
import React, { createContext, useContext, useEffect, useCallback, useState } from "react";
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

function calculateRatios(current) {
  const children = defaultChannels.map(channel => current[channel] || 0);
  const sum = children.reduce((a, b) => a + b, 0);
  return sum === 0
    ? children.map(() => 0)
    : children.map(v => v / sum);
}

function recalcChildrenFromTotal(channels, newTotal) {
  const ratios = calculateRatios(channels);
  const newChannels = { ...channels };
  ratios.forEach((ratio, idx) => {
    const channel = defaultChannels[idx];
    newChannels[channel] = Number((newTotal * ratio).toFixed(2));
  });
  newChannels.total = Number(newTotal.toFixed(2));
  return newChannels;
}

function recalcTotalFromChildren(channels) {
  const total = defaultChannels.reduce((sum, c) => sum + (channels[c] || 0), 0);
  return { ...channels, total: Number(total.toFixed(2)) };
}

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
        // Always make sure at least one entry for the initial filterKey exists!
        const initialFKey = `${parsed.filters?.dateRange || defaultFilters.dateRange}:${parsed.filters?.viewMode || defaultFilters.viewMode}`;
        return {
          ...parsed.statsByFilter,
          [initialFKey]: parsed.statsByFilter?.[initialFKey] || { ...defaultStats }
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

  // Helper to always flush to cookie right after state change
  function persistCookie(newStatsByFilter, newFilters) {
    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({ statsByFilter: newStatsByFilter, filters: newFilters }),
      { expires: 365 }
    );
  }

  // Compose filterKey
  const filterKey = `${filters.dateRange}:${filters.viewMode}`;

  // --- Updaters ---
  const setDateRange = useCallback(range => {
    setFilters(f => {
      const newFilters = { ...f, dateRange: range };
      // Immediately update statsByFilter for new filterKey (if missing)
      setStatsByFilter(prevStats => {
        const newKey = `${range}:${newFilters.viewMode}`;
        const updated = {
          ...prevStats,
          [newKey]: prevStats[newKey] ?? { ...defaultStats },
        };
        persistCookie(updated, newFilters);
        return updated;
      });
      persistCookie(statsByFilter, newFilters);
      return newFilters;
    });
  }, [statsByFilter]);

  const setViewMode = useCallback(mode => {
    setFilters(f => {
      const newFilters = { ...f, viewMode: mode };
      setStatsByFilter(prevStats => {
        const newKey = `${newFilters.dateRange}:${mode}`;
        const updated = {
          ...prevStats,
          [newKey]: prevStats[newKey] ?? { ...defaultStats }
        };
        persistCookie(updated, newFilters);
        return updated;
      });
      persistCookie(statsByFilter, newFilters);
      return newFilters;
    });
  }, [statsByFilter]);

  const updateTotalEarnings = useCallback(value => {
    setStatsByFilter(prev => {
      const existing = prev[filterKey] ?? { ...defaultStats };
      const updated = {
        ...prev,
        [filterKey]: recalcChildrenFromTotal(existing, value),
      };
      persistCookie(updated, filters);
      return updated;
    });
  }, [filterKey, filters]);

  const updateChannelValue = useCallback((channel, value) => {
    if (!defaultChannels.includes(channel)) return;
    setStatsByFilter(prev => {
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
  }, [filterKey, filters]);

  const resetStats = useCallback(() => {
    setStatsByFilter(prev => {
      const updated = { ...prev, [filterKey]: { ...defaultStats } };
      persistCookie(updated, filters);
      return updated;
    });
  }, [filterKey, filters]);

  // Always read latest for UI
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
