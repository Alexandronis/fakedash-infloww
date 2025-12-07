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
  // NEW: Object storing arrays for EACH channel
  channelData: {
    subscriptions: [],
    tips: [],
    posts: [],
    referrals: [],
    messages: [],
    streams: []
  }
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
  updateGraphColumn: (index: number, newValue: number) => {}, // Keep for backward compat (Highcharts)
  updateChannelGraphPoint: (channel: string, index: number, value: number) => {}, // NEW for Chart.js
  setDateRange: (range: string) => {},
  setViewMode: (mode: "day" | "week") => {},
  resetStats: () => {},
});

export const useCreatorStats = () => useContext(CreatorStatsContext);

// ======= HELPERS =======

const fallbackBaseDistribution = {
  subscriptions: 0.19,
  tips: 5.65,
  posts: 0,
  referrals: 0,
  messages: 41.84,
  streams: 0,
};
const fallbackBaseTotal = Object.values(fallbackBaseDistribution).reduce((sum, v) => sum + v, 0);

function getGraphLength(dateRange, viewMode) {
  const [startStr, endStr] = dateRange.split("_");
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return viewMode === "week" ? Math.ceil(diffDays / 7) : diffDays;
}

// Generate organic distribution for a specific target sum
function generateOrganicDistribution(total, count) {
  if (count <= 0) return [];
  if (total <= 0) return Array(count).fill(0);
  if (count === 1) return [total];

  const weights = Array(count).fill(0).map(() => Math.random() + 0.3);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  let distributed = weights.map(w => Number(((w / weightSum) * total).toFixed(2)));

  const currentSum = distributed.reduce((a, b) => a + b, 0);
  let diff = Number((total - currentSum).toFixed(2));

  if (diff !== 0) {
    const mid = Math.floor(count / 2);
    distributed[mid] = Number((distributed[mid] + diff).toFixed(2));
  }
  return distributed.map(v => (v < 0 ? 0 : v));
}

// Recalculate everything based on a NEW GRAND TOTAL (Scaling all channels)
function recalcFromGrandTotal(currentStats, newTotal, graphLen) {
  const nextStats = { ...currentStats, channelData: { ...currentStats.channelData } };

  // 1. Determine Channel Splits (Ratios)
  const currentChildrenSum = defaultChannels.reduce((acc, ch) => acc + (currentStats[ch] || 0), 0);
  const channelTargets = {};

  if (newTotal <= 0) {
    defaultChannels.forEach(ch => channelTargets[ch] = 0);
  } else if (currentChildrenSum === 0) {
    // Use fallback distribution
    defaultChannels.forEach(ch => {
      const base = fallbackBaseDistribution[ch] || 0;
      const ratio = fallbackBaseTotal > 0 ? base / fallbackBaseTotal : (ch === 'messages' ? 1 : 0);
      channelTargets[ch] = Number((newTotal * ratio).toFixed(2));
    });
  } else {
    // Use existing ratios
    defaultChannels.forEach(ch => {
      const ratio = (currentStats[ch] || 0) / currentChildrenSum;
      channelTargets[ch] = Number((newTotal * ratio).toFixed(2));
    });
  }

  // 2. Update Each Channel's Array & Sum
  let actualTotal = 0;
  defaultChannels.forEach(ch => {
    const target = channelTargets[ch];
    nextStats[ch] = target;

    // Scale array
    let arr = nextStats.channelData[ch] || [];
    if (arr.length !== graphLen) arr = Array(graphLen).fill(0);

    const arrSum = arr.reduce((a, b) => a + b, 0);
    if (arrSum === 0) {
      nextStats.channelData[ch] = generateOrganicDistribution(target, graphLen);
    } else {
      const ratio = target / arrSum;
      nextStats.channelData[ch] = arr.map(v => Number((v * ratio).toFixed(2)));
    }
    actualTotal += target;
  });

  nextStats.total = Number(actualTotal.toFixed(2));

  // Legacy support for Highcharts (Sum of all channels per day)
  nextStats.graphData = Array(graphLen).fill(0).map((_, i) => {
    return defaultChannels.reduce((sum, ch) => sum + (nextStats.channelData[ch][i] || 0), 0);
  });

  return nextStats;
}

// Recalculate based on specific Channel Input
function recalcFromChannelInput(currentStats, channel, newValue, graphLen) {
  const nextStats = { ...currentStats, channelData: { ...currentStats.channelData } };

  // Update scalar
  nextStats[channel] = Number(newValue.toFixed(2));

  // Update Array
  let arr = nextStats.channelData[channel] || [];
  if (arr.length !== graphLen) arr = Array(graphLen).fill(0);
  const arrSum = arr.reduce((a, b) => a + b, 0);

  if (arrSum === 0) {
    nextStats.channelData[channel] = generateOrganicDistribution(newValue, graphLen);
  } else {
    const ratio = newValue / arrSum;
    nextStats.channelData[channel] = arr.map(v => Number((v * ratio).toFixed(2)));
  }

  // Recalc Grand Total
  const newTotal = defaultChannels.reduce((sum, ch) => sum + (nextStats[ch] || 0), 0);
  nextStats.total = Number(newTotal.toFixed(2));

  // Update Legacy GraphData
  nextStats.graphData = Array(graphLen).fill(0).map((_, i) => {
    return defaultChannels.reduce((sum, ch) => sum + (nextStats.channelData[ch][i] || 0), 0);
  });

  return nextStats;
}

// Recalculate based on Dragging a single point
function recalcFromPointDrag(currentStats, channel, index, pointValue, graphLen) {
  const nextStats = { ...currentStats, channelData: { ...currentStats.channelData } };

  // Update specific point
  const newArr = [...(nextStats.channelData[channel] || Array(graphLen).fill(0))];
  newArr[index] = Number(pointValue.toFixed(2));
  nextStats.channelData[channel] = newArr;

  // Update Channel Sum
  const newChanSum = newArr.reduce((a, b) => a + b, 0);
  nextStats[channel] = Number(newChanSum.toFixed(2));

  // Update Grand Total
  const newTotal = defaultChannels.reduce((sum, ch) => sum + (nextStats[ch] || 0), 0);
  nextStats.total = Number(newTotal.toFixed(2));

  // Update Legacy GraphData
  nextStats.graphData = Array(graphLen).fill(0).map((_, i) => {
    return defaultChannels.reduce((sum, ch) => sum + (nextStats.channelData[ch][i] || 0), 0);
  });

  return nextStats;
}

// ======= PROVIDER =======

export const CreatorStatsProvider = ({ children }) => {
  const [filters, setFilters] = useState(() => {
    try { return JSON.parse(Cookies.get(COOKIE_KEY) || "{}").filters || { ...defaultFilters }; }
    catch { return { ...defaultFilters }; }
  });

  const [statsByFilter, setStatsByFilter] = useState(() => {
    try { return JSON.parse(Cookies.get(COOKIE_KEY) || "{}").statsByFilter || {}; }
    catch { return {}; }
  });

  const persistCookie = (newStatsByFilter, newFilters) => {
    Cookies.set(COOKIE_KEY, JSON.stringify({ statsByFilter: newStatsByFilter, filters: newFilters }), { expires: 365 });
  };

  const filterKey = `${filters.dateRange}:${filters.viewMode}`;

  // Ensure full structure exists
  const ensureStatsExist = (currentStatsByFilter, fRange, fMode, sourceStats = null) => {
    const key = `${fRange}:${fMode}`;
    const existing = currentStatsByFilter[key];
    const neededLen = getGraphLength(fRange, fMode);

    // Helper to init empty channel data
    const initChannelData = () => {
      const d = {};
      defaultChannels.forEach(ch => d[ch] = Array(neededLen).fill(0));
      return d;
    };

    if (!existing) {
      if (sourceStats) {
        // Copy logic: Distribute OLD totals organically into NEW arrays
        const newStats = { ...defaultStats, channelData: {} };
        let totalSum = 0;
        defaultChannels.forEach(ch => {
          const val = sourceStats[ch] || 0;
          newStats[ch] = val;
          newStats.channelData[ch] = generateOrganicDistribution(val, neededLen);
          totalSum += val;
        });
        newStats.total = Number(totalSum.toFixed(2));
        newStats.graphData = Array(neededLen).fill(0).map((_, i) =>
          defaultChannels.reduce((sum, ch) => sum + newStats.channelData[ch][i], 0)
        );
        return { ...currentStatsByFilter, [key]: newStats };
      }
      return { ...currentStatsByFilter, [key]: { ...defaultStats, channelData: initChannelData(), graphData: Array(neededLen).fill(0) } };
    }

    // Check array length validity
    if (!existing.channelData || existing.channelData.subscriptions.length !== neededLen) {
      // Re-init with existing sums
      const newStats = { ...existing, channelData: {} };
      defaultChannels.forEach(ch => {
        newStats.channelData[ch] = generateOrganicDistribution(existing[ch] || 0, neededLen);
      });
      // Fix legacy graphData
      newStats.graphData = Array(neededLen).fill(0).map((_, i) =>
        defaultChannels.reduce((sum, ch) => sum + newStats.channelData[ch][i], 0)
      );
      return { ...currentStatsByFilter, [key]: newStats };
    }

    return currentStatsByFilter;
  };

  // --- Updaters ---

  const setDateRange = useCallback(range => {
    setFilters(f => {
      const newFilters = { ...f, dateRange: range };
      setStatsByFilter(prev => {
        const withInit = ensureStatsExist(prev, range, newFilters.viewMode, null);
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
        const oldKey = `${f.dateRange}:${f.viewMode}`;
        const oldStats = prev[oldKey];
        const withInit = ensureStatsExist(prev, newFilters.dateRange, mode, oldStats);
        persistCookie(withInit, newFilters);
        return withInit;
      });
      return newFilters;
    });
  }, []);

  const updateTotalEarnings = useCallback(value => {
    setStatsByFilter(prev => {
      const len = getGraphLength(filters.dateRange, filters.viewMode);
      const withInit = ensureStatsExist(prev, filters.dateRange, filters.viewMode);
      const updatedStats = recalcFromGrandTotal(withInit[filterKey], value, len);
      const final = { ...withInit, [filterKey]: updatedStats };
      persistCookie(final, filters);
      return final;
    });
  }, [filterKey, filters]);

  const updateChannelValue = useCallback((channel, value) => {
    if (!defaultChannels.includes(channel)) return;
    setStatsByFilter(prev => {
      const len = getGraphLength(filters.dateRange, filters.viewMode);
      const withInit = ensureStatsExist(prev, filters.dateRange, filters.viewMode);
      const updatedStats = recalcFromChannelInput(withInit[filterKey], channel, value, len);
      const final = { ...withInit, [filterKey]: updatedStats };
      persistCookie(final, filters);
      return final;
    });
  }, [filterKey, filters]);

  // NEW: Update specific channel point (Drag)
  const updateChannelGraphPoint = useCallback((channel, index, value) => {
    setStatsByFilter(prev => {
      const len = getGraphLength(filters.dateRange, filters.viewMode);
      const withInit = ensureStatsExist(prev, filters.dateRange, filters.viewMode);
      const updatedStats = recalcFromPointDrag(withInit[filterKey], channel, index, value, len);
      const final = { ...withInit, [filterKey]: updatedStats };
      persistCookie(final, filters);
      return final;
    });
  }, [filterKey, filters]);

  // Legacy support for Highcharts
  const updateGraphColumn = useCallback((index, value) => {
    // If user drags the Highchart (Total), we must distribute that new total-for-day
    // evenly or proportionally to the channels for that day.
    // For simplicity: We scale all channels at that index.
    setStatsByFilter(prev => {
      const len = getGraphLength(filters.dateRange, filters.viewMode);
      const withInit = ensureStatsExist(prev, filters.dateRange, filters.viewMode);
      const stats = { ...withInit[filterKey], channelData: { ...withInit[filterKey].channelData } };

      const oldTotalAtIdx = defaultChannels.reduce((sum, ch) => sum + (stats.channelData[ch][index] || 0), 0);

      defaultChannels.forEach(ch => {
        const currentVal = stats.channelData[ch][index] || 0;
        // Avoid div by zero
        let newVal = 0;
        if (oldTotalAtIdx === 0) {
          // Fallback distribution
          const base = fallbackBaseDistribution[ch];
          const ratio = base / fallbackBaseTotal;
          newVal = Number((value * ratio).toFixed(2));
        } else {
          const ratio = currentVal / oldTotalAtIdx;
          newVal = Number((value * ratio).toFixed(2));
        }
        stats.channelData[ch] = [...stats.channelData[ch]]; // Copy array
        stats.channelData[ch][index] = newVal;
      });

      // Recalc Sums
      let grandTotal = 0;
      defaultChannels.forEach(ch => {
        const s = stats.channelData[ch].reduce((a, b) => a + b, 0);
        stats[ch] = Number(s.toFixed(2));
        grandTotal += s;
      });
      stats.total = Number(grandTotal.toFixed(2));

      // Fix legacy graphData
      stats.graphData = Array(len).fill(0).map((_, i) =>
        defaultChannels.reduce((sum, ch) => sum + stats.channelData[ch][i], 0)
      );

      const final = { ...withInit, [filterKey]: stats };
      persistCookie(final, filters);
      return final;
    });
  }, [filterKey, filters]);

  const resetStats = useCallback(() => {
    setStatsByFilter(prev => {
      const withInit = ensureStatsExist(prev, filters.dateRange, filters.viewMode);
      const final = { ...withInit, [filterKey]: undefined }; // Will trigger re-init empty next render
      persistCookie(final, filters);
      return final;
    });
  }, [filterKey, filters]);

  const currentStats = (() => {
    const len = getGraphLength(filters.dateRange, filters.viewMode);
    if (!statsByFilter[filterKey]) return { ...defaultStats, graphData: Array(len).fill(0) };
    return statsByFilter[filterKey];
  })();

  const ctx = {
    stats: currentStats,
    filters,
    updateTotalEarnings,
    updateChannelValue,
    updateGraphColumn,
    updateChannelGraphPoint, // Expose new method
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
