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
  // NEW: Store the visual shape of the graph
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
  updateGraphColumn: (index: number, newValue: number) => {}, // NEW method for chart
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

// Helper to determine graph length based on filters
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

  // 2. Recalc Graph Data (Scale Proportionally)
  const oldGraphSum = (newChannels.graphData || []).reduce((a, b) => a + b, 0);
  if (!newChannels.graphData || newChannels.graphData.length === 0) {
    // Should not happen if initialized, but safe fallback
    newChannels.graphData = [newChannels.total];
  } else if (oldGraphSum === 0) {
    // Distribute evenly if it was zero
    const val = newChannels.total / newChannels.graphData.length;
    newChannels.graphData = newChannels.graphData.map(() => Number(val.toFixed(2)));
  } else {
    // Scale existing shape
    const ratio = newChannels.total / oldGraphSum;
    newChannels.graphData = newChannels.graphData.map(v => Number((v * ratio).toFixed(2)));
  }

  return newChannels;
}

function recalcTotalFromChildren(channels) {
  const total = defaultChannels.reduce((sum, c) => sum + (channels[c] || 0), 0);

  // Also scale graph to match new total
  const newChannels = { ...channels, total: Number(total.toFixed(2)) };
  const oldGraphSum = (newChannels.graphData || []).reduce((a, b) => a + b, 0);

  if (oldGraphSum > 0 && total > 0) {
    const ratio = total / oldGraphSum;
    newChannels.graphData = newChannels.graphData.map(v => Number((v * ratio).toFixed(2)));
  } else if (newChannels.graphData && newChannels.graphData.length > 0) {
    const val = total / newChannels.graphData.length;
    newChannels.graphData = newChannels.graphData.map(() => Number(val.toFixed(2)));
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
      const loadedStats = parsed.statsByFilter || {};
      return loadedStats;
    } catch { return {}; }
  });

  const persistCookie = (newStatsByFilter, newFilters) => {
    Cookies.set(COOKIE_KEY, JSON.stringify({ statsByFilter: newStatsByFilter, filters: newFilters }), { expires: 365 });
  };

  const filterKey = `${filters.dateRange}:${filters.viewMode}`;

  // Ensure current filter stats exist and have correct graph length
  const ensureStatsExist = (currentStatsByFilter, fRange, fMode) => {
    const key = `${fRange}:${fMode}`;
    const existing = currentStatsByFilter[key];
    const neededLen = getGraphLength(fRange, fMode);

    if (!existing) {
      return {
        ...currentStatsByFilter,
        [key]: {
          ...defaultStats,
          graphData: Array(neededLen).fill(0)
        }
      };
    }

    // If graph length doesn't match (e.g. changed date range length), re-init graph with 0s
    if (!existing.graphData || existing.graphData.length !== neededLen) {
      return {
        ...currentStatsByFilter,
        [key]: {
          ...existing,
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
        const withInit = ensureStatsExist(prev, newFilters.dateRange, mode);
        persistCookie(withInit, newFilters);
        return withInit;
      });
      return newFilters;
    });
  }, []);

  const updateTotalEarnings = useCallback(value => {
    setStatsByFilter(prev => {
      const key = filterKey;
      // Ensure exists first
      const withInit = ensureStatsExist(prev, filters.dateRange, filters.viewMode);
      const existing = withInit[key];

      const updatedStats = recalcChildrenFromTotal(existing, value);

      const final = { ...withInit, [key]: updatedStats };
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

  // NEW: Update a specific column in the graph (from Drag event)
  const updateGraphColumn = useCallback((index, newValue) => {
    setStatsByFilter(prev => {
      const withInit = ensureStatsExist(prev, filters.dateRange, filters.viewMode);
      const existing = withInit[filterKey];

      const newGraphData = [...existing.graphData];
      if (index >= 0 && index < newGraphData.length) {
        newGraphData[index] = Number(newValue.toFixed(2));
      }

      // Calculate new total from the graph
      const newTotal = newGraphData.reduce((a, b) => a + b, 0);

      // Use our existing helper to distribute this new total to channels
      // BUT we must manually override the graphData afterwards because
      // recalcChildrenFromTotal would try to rescale the old graph
      const tempStats = recalcChildrenFromTotal(existing, newTotal);
      tempStats.graphData = newGraphData; // Enforce our dragged shape

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
        [filterKey]: {
          ...defaultStats,
          graphData: Array(neededLen).fill(0)
        }
      };
      persistCookie(updated, filters);
      return updated;
    });
  }, [filterKey, filters]);

  // Read current stats (safely initialized)
  const currentStats = (() => {
    const neededLen = getGraphLength(filters.dateRange, filters.viewMode);
    const existing = statsByFilter[filterKey];
    if (!existing || !existing.graphData || existing.graphData.length !== neededLen) {
      // Return a temporary default if state update hasn't propagated yet
      return { ...defaultStats, graphData: Array(neededLen).fill(0) };
    }
    return existing;
  })();

  const ctx = {
    stats: currentStats,
    filters,
    updateTotalEarnings,
    updateChannelValue,
    updateGraphColumn, // Exported new method
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
