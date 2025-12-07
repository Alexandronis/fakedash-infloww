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
  graphData: [],
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
  updateGraphColumn: (index: number, newValue: number) => {},
  setDateRange: (range: string) => {},
  setViewMode: (mode: "day" | "week") => {},
  resetStats: () => {},
});

export const useCreatorStats = () => useContext(CreatorStatsContext);

// ======= CALC HELPERS =======

const fallbackBaseDistribution = {
  subscriptions: 0.19,
  tips: 5.65,
  posts: 0,
  referrals: 0,
  messages: 41.84,
  streams: 0,
};
const fallbackBaseTotal = Object.values(fallbackBaseDistribution).reduce((sum, v) => sum + v, 0);

// NEW: Helper to split a Total into N random parts that sum up exactly to Total
// This makes the graph look "Real" instead of flat
function generateOrganicDistribution(total: number, count: number) {
  if (count <= 0) return [];
  if (total <= 0) return Array(count).fill(0);
  if (count === 1) return [total];

  // 1. Generate random weights (0.3 to 1.3 range to avoid extreme spikes/drops)
  const weights = Array(count).fill(0).map(() => Math.random() + 0.3);
  const weightSum = weights.reduce((a, b) => a + b, 0);

  // 2. Distribute total based on weights
  let distributed = weights.map(w => Number(((w / weightSum) * total).toFixed(2)));

  // 3. Fix rounding errors (ensure sum is exactly Total)
  const currentSum = distributed.reduce((a, b) => a + b, 0);
  let diff = Number((total - currentSum).toFixed(2));

  // Add/Subtract the difference to a random element (or the middle one) to hide it
  if (diff !== 0) {
    const mid = Math.floor(count / 2);
    distributed[mid] = Number((distributed[mid] + diff).toFixed(2));
  }

  // Double check for negatives (floating point safety)
  return distributed.map(v => (v < 0 ? 0 : v));
}

function getGraphLength(dateRange, viewMode) {
  const [startStr, endStr] = dateRange.split("_");
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (viewMode === "week") {
    return Math.ceil(diffDays / 7);
  }
  return diffDays;
}

function calculateRatios(current) {
  const children = defaultChannels.map(channel => current[channel] || 0);
  const sum = children.reduce((a, b) => a + b, 0);
  return sum === 0 ? children.map(() => 0) : children.map(v => v / sum);
}

function recalcChildrenFromTotal(channels, newTotal) {
  const childrenSum = defaultChannels.reduce((sum, c) => sum + (channels[c] || 0), 0);
  const newChannels = { ...channels };

  // 1. Recalc Channels
  if (newTotal <= 0) {
    defaultChannels.forEach(ch => newChannels[ch] = 0);
    newChannels.total = 0;
  } else if (childrenSum === 0) {
    if (fallbackBaseTotal > 0) {
      defaultChannels.forEach(ch => {
        const base = fallbackBaseDistribution[ch] || 0;
        const ratio = base / fallbackBaseTotal;
        newChannels[ch] = Number((newTotal * ratio).toFixed(2));
      });
    } else {
      defaultChannels.forEach(ch => newChannels[ch] = ch === "messages" ? Number(newTotal.toFixed(2)) : 0);
    }
  } else {
    const ratios = calculateRatios(channels);
    ratios.forEach((ratio, idx) => {
      const channel = defaultChannels[idx];
      newChannels[channel] = Number((newTotal * ratio).toFixed(2));
    });
  }
  newChannels.total = Number(newTotal.toFixed(2));

  // 2. Recalc Graph Data (Scale or Organic Init)
  const oldGraphSum = (newChannels.graphData || []).reduce((a, b) => a + b, 0);

  if (!newChannels.graphData || newChannels.graphData.length === 0) {
    // Safety fallback
    newChannels.graphData = [newChannels.total];
  } else if (oldGraphSum === 0) {
    // Was zero, now has value -> Distribute Organically
    newChannels.graphData = generateOrganicDistribution(newChannels.total, newChannels.graphData.length);
  } else {
    // Existing shape exists -> Scale it (keep the shape)
    const ratio = newChannels.total / oldGraphSum;
    newChannels.graphData = newChannels.graphData.map(v => Number((v * ratio).toFixed(2)));
  }

  return newChannels;
}

function recalcTotalFromChildren(channels) {
  const total = defaultChannels.reduce((sum, c) => sum + (channels[c] || 0), 0);
  const newChannels = { ...channels, total: Number(total.toFixed(2)) };

  const oldGraphSum = (newChannels.graphData || []).reduce((a, b) => a + b, 0);

  if (oldGraphSum > 0 && total > 0) {
    // Scale existing shape
    const ratio = total / oldGraphSum;
    newChannels.graphData = newChannels.graphData.map(v => Number((v * ratio).toFixed(2)));
  } else if (newChannels.graphData && newChannels.graphData.length > 0) {
    // Was zero, distribute organically
    newChannels.graphData = generateOrganicDistribution(total, newChannels.graphData.length);
  }
  return newChannels;
}

// ======= PROVIDER =======

export const CreatorStatsProvider = ({ children }) => {
  const [filters, setFilters] = useState(() => {
    const cookieRaw = Cookies.get(COOKIE_KEY);
    if (cookieRaw) {
      try { return JSON.parse(cookieRaw).filters || { ...defaultFilters }; }
      catch { return { ...defaultFilters }; }
    }
    return { ...defaultFilters };
  });

  const [statsByFilter, setStatsByFilter] = useState(() => {
    const cookieRaw = Cookies.get(COOKIE_KEY);
    try {
      const parsed = JSON.parse(cookieRaw || "{}");
      return parsed.statsByFilter || {};
    } catch { return {}; }
  });

  const persistCookie = (newStatsByFilter, newFilters) => {
    Cookies.set(COOKIE_KEY, JSON.stringify({ statsByFilter: newStatsByFilter, filters: newFilters }), { expires: 365 });
  };

  const filterKey = `${filters.dateRange}:${filters.viewMode}`;

  // Helper: Ensures stats exist for a key. If missing, inits with 0s.
  const ensureStatsExist = (currentStatsByFilter, fRange, fMode) => {
    const key = `${fRange}:${fMode}`;
    const existing = currentStatsByFilter[key];
    const neededLen = getGraphLength(fRange, fMode);

    if (!existing || !existing.graphData || existing.graphData.length !== neededLen) {
      return {
        ...currentStatsByFilter,
        [key]: {
          ...defaultStats,
          graphData: Array(neededLen).fill(0)
        }
      };
    }
    return currentStatsByFilter;
  };

  // --- Updaters ---

  const setDateRange = useCallback(range => {
    setFilters(f => {
      const newFilters = { ...f, dateRange: range };
      setStatsByFilter(prev => {
        // Changing Date Range => Start fresh (0s).
        const withInit = ensureStatsExist(prev, range, newFilters.viewMode);
        persistCookie(withInit, newFilters);
        return withInit;
      });
      return newFilters;
    });
  }, []);

  const setViewMode = useCallback(mode => {
    setFilters(f => {
      const newFilters = { ...f, viewMode: mode };

      setStatsByFilter(prev => {
        // 1. Get Old Stats
        const oldKey = `${f.dateRange}:${f.viewMode}`;
        const oldStats = prev[oldKey] || defaultStats;

        // 2. Prepare New Key & Graph Length
        const newKey = `${f.dateRange}:${mode}`;
        const newLen = getGraphLength(f.dateRange, mode);

        // 3. GENERATE NEW ORGANIC DISTRIBUTION
        const newGraphData = generateOrganicDistribution(oldStats.total, newLen);

        const newStats = {
          ...oldStats, // Copy Subscriptions, Messages, Total, etc.
          graphData: newGraphData // Overwrite with new organic shape
        };

        // 4. Update State
        const updated = {
          ...prev,
          [newKey]: newStats
        };

        persistCookie(updated, newFilters);
        return updated;
      });

      return newFilters;
    });
  }, []);

  const updateTotalEarnings = useCallback(value => {
    setStatsByFilter(prev => {
      const withInit = ensureStatsExist(prev, filters.dateRange, filters.viewMode);
      const existing = withInit[filterKey];
      const updatedStats = recalcChildrenFromTotal(existing, value);
      const final = { ...withInit, [filterKey]: updatedStats };
      persistCookie(final, filters);
      return final;
    });
  }, [filterKey, filters]);

  const updateChannelValue = useCallback((channel, value) => {
    if (!defaultChannels.includes(channel)) return;
    setStatsByFilter(prev => {
      const withInit = ensureStatsExist(prev, filters.dateRange, filters.viewMode);
      const existing = withInit[filterKey];
      const newChannels = { ...existing };
      newChannels[channel] = Number(value.toFixed(2));
      const updatedStats = recalcTotalFromChildren(newChannels);
      const final = { ...withInit, [filterKey]: updatedStats };
      persistCookie(final, filters);
      return final;
    });
  }, [filterKey, filters]);

  const updateGraphColumn = useCallback((index, newValue) => {
    setStatsByFilter(prev => {
      const withInit = ensureStatsExist(prev, filters.dateRange, filters.viewMode);
      const existing = withInit[filterKey];
      const newGraphData = [...existing.graphData];
      if (index >= 0 && index < newGraphData.length) {
        newGraphData[index] = Number(newValue.toFixed(2));
      }
      const newTotal = newGraphData.reduce((a, b) => a + b, 0);
      const tempStats = recalcChildrenFromTotal(existing, newTotal);
      tempStats.graphData = newGraphData;
      const final = { ...withInit, [filterKey]: tempStats };
      persistCookie(final, filters);
      return final;
    });
  }, [filterKey, filters]);

  const resetStats = useCallback(() => {
    setStatsByFilter(prev => {
      const neededLen = getGraphLength(filters.dateRange, filters.viewMode);
      const updated = {
        ...prev,
        [filterKey]: { ...defaultStats, graphData: Array(neededLen).fill(0) }
      };
      persistCookie(updated, filters);
      return updated;
    });
  }, [filterKey, filters]);

  const currentStats = (() => {
    const neededLen = getGraphLength(filters.dateRange, filters.viewMode);
    const existing = statsByFilter[filterKey];
    if (!existing || !existing.graphData || existing.graphData.length !== neededLen) {
      return { ...defaultStats, graphData: Array(neededLen).fill(0) };
    }
    return existing;
  })();

  const ctx = {
    stats: currentStats,
    filters,
    updateTotalEarnings,
    updateChannelValue,
    updateGraphColumn,
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
