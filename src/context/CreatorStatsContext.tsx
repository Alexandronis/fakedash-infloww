// @ts-nocheck
import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";

// --- CONSTANTS & DEFAULTS ---

const defaultChannels = ["subscriptions", "tips", "posts", "referrals", "messages", "streams"];

const defaultStats = {
  total: 0,
  subscriptions: 0,
  tips: 0,
  posts: 0,
  referrals: 0,
  messages: 0,
  streams: 0,
  creatorsCount: 0,
  refundedEarnings: 0,
  channelData: {
    subscriptions: [],
    tips: [],
    posts: [],
    referrals: [],
    messages: [],
    streams: []
  },
  graphData: [] // Legacy support
};

const defaultUserSettings = {
  userName: "Agency",
  avatarName: "Ag",
  avatarIsImage: false,
  appVersion: "5.6.1",
  messagesPro: 0,
  timezone: "UTC+01:00",
  headerAlignment: "left",
  showOfBadge: true
};

const defaultFilters = {
  dateRange: "2023-11-30_2023-12-13",
  viewMode: "week",
};

const COOKIE_KEY = "creatorStats_v6"; // Bump to v6 for clean slate

// --- CONTEXT DEFINITION ---

const CreatorStatsContext = createContext({
  stats: { ...defaultStats },
  userSettings: { ...defaultUserSettings },
  filters: { ...defaultFilters },

  updateTotalEarnings: (value: number) => {},
  updateChannelValue: (channel: string, value: number) => {},
  updateGraphColumn: (index: number, newValue: number) => {},
  updateChannelGraphPoint: (channel: string, index: number, value: number) => {},
  updateCreatorsCount: (value: number) => {},
  updateRefundedEarnings: (value: number) => {},
  updateUserSettings: (settings: Partial<typeof defaultUserSettings>) => {},

  setDateRange: (range: string) => {},
  setViewMode: (mode: "day" | "week") => {},
  resetStats: () => {},
});

export const useCreatorStats = () => useContext(CreatorStatsContext);

// --- CALCULATION HELPERS ---

const fallbackBaseDistribution = {
  subscriptions: 0.19,
  tips: 5.65,
  posts: 0,
  referrals: 0,
  messages: 41.84,
  streams: 0,
};
const fallbackBaseTotal = 47.68;

function getGraphLength(dateRange, viewMode) {
  const [startStr, endStr] = dateRange.split("_");
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return viewMode === "week" ? Math.ceil(diffDays / 7) : diffDays;
}

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

// Recalculate based on NEW GRAND TOTAL
function recalcFromGrandTotal(currentStats, newTotal, graphLen) {
  const nextStats = { ...currentStats, channelData: { ...currentStats.channelData } };
  const currentChildrenSum = defaultChannels.reduce((acc, ch) => acc + (currentStats[ch] || 0), 0);
  const channelTargets = {};

  if (newTotal <= 0) {
    defaultChannels.forEach(ch => channelTargets[ch] = 0);
  } else if (currentChildrenSum === 0) {
    defaultChannels.forEach(ch => {
      const base = fallbackBaseDistribution[ch] || 0;
      const ratio = fallbackBaseTotal > 0 ? base / fallbackBaseTotal : (ch === 'messages' ? 1 : 0);
      channelTargets[ch] = Number((newTotal * ratio).toFixed(2));
    });
  } else {
    defaultChannels.forEach(ch => {
      const ratio = (currentStats[ch] || 0) / currentChildrenSum;
      channelTargets[ch] = Number((newTotal * ratio).toFixed(2));
    });
  }

  let actualTotal = 0;
  defaultChannels.forEach(ch => {
    const target = channelTargets[ch];
    nextStats[ch] = target;

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
  nextStats.graphData = Array(graphLen).fill(0).map((_, i) =>
    defaultChannels.reduce((sum, ch) => sum + (nextStats.channelData[ch][i] || 0), 0)
  );
  return nextStats;
}

// Recalculate based on CHANNEL INPUT
function recalcFromChannelInput(currentStats, channel, newValue, graphLen) {
  const nextStats = { ...currentStats, channelData: { ...currentStats.channelData } };
  nextStats[channel] = Number(newValue.toFixed(2));

  let arr = nextStats.channelData[channel] || [];
  if (arr.length !== graphLen) arr = Array(graphLen).fill(0);
  const arrSum = arr.reduce((a, b) => a + b, 0);

  if (arrSum === 0) {
    nextStats.channelData[channel] = generateOrganicDistribution(newValue, graphLen);
  } else {
    const ratio = newValue / arrSum;
    nextStats.channelData[channel] = arr.map(v => Number((v * ratio).toFixed(2)));
  }

  const newTotal = defaultChannels.reduce((sum, ch) => sum + (nextStats[ch] || 0), 0);
  nextStats.total = Number(newTotal.toFixed(2));
  nextStats.graphData = Array(graphLen).fill(0).map((_, i) =>
    defaultChannels.reduce((sum, ch) => sum + (nextStats.channelData[ch][i] || 0), 0)
  );
  return nextStats;
}

// Recalculate based on POINT DRAG
function recalcFromPointDrag(currentStats, channel, index, pointValue, graphLen) {
  const nextStats = { ...currentStats, channelData: { ...currentStats.channelData } };

  const newArr = [...(nextStats.channelData[channel] || Array(graphLen).fill(0))];
  newArr[index] = Number(pointValue.toFixed(2));
  nextStats.channelData[channel] = newArr;

  const newChanSum = newArr.reduce((a, b) => a + b, 0);
  nextStats[channel] = Number(newChanSum.toFixed(2));

  const newTotal = defaultChannels.reduce((sum, ch) => sum + (nextStats[ch] || 0), 0);
  nextStats.total = Number(newTotal.toFixed(2));
  nextStats.graphData = Array(graphLen).fill(0).map((_, i) =>
    defaultChannels.reduce((sum, ch) => sum + (nextStats.channelData[ch][i] || 0), 0)
  );
  return nextStats;
}

// Recalculate based on GRAPH COLUMN DRAG (Highcharts)
function recalcFromGraphColumn(currentStats, index, newValue, graphLen) {
  const nextStats = { ...currentStats, channelData: { ...currentStats.channelData } };

  const oldTotalAtIdx = defaultChannels.reduce((sum, ch) => sum + (nextStats.channelData[ch][index] || 0), 0);

  defaultChannels.forEach(ch => {
    const currentVal = nextStats.channelData[ch][index] || 0;
    let newVal = 0;
    if (oldTotalAtIdx === 0) {
      const base = fallbackBaseDistribution[ch];
      const ratio = base / fallbackBaseTotal;
      newVal = Number((newValue * ratio).toFixed(2));
    } else {
      const ratio = currentVal / oldTotalAtIdx;
      newVal = Number((newValue * ratio).toFixed(2));
    }
    nextStats.channelData[ch] = [...nextStats.channelData[ch]];
    nextStats.channelData[ch][index] = newVal;
  });

  let grandTotal = 0;
  defaultChannels.forEach(ch => {
    const s = nextStats.channelData[ch].reduce((a, b) => a + b, 0);
    nextStats[ch] = Number(s.toFixed(2));
    grandTotal += s;
  });
  nextStats.total = Number(grandTotal.toFixed(2));
  nextStats.graphData = Array(graphLen).fill(0).map((_, i) =>
    defaultChannels.reduce((sum, ch) => sum + nextStats.channelData[ch][i], 0)
  );
  return nextStats;
}

// ======= PROVIDER =======

export const CreatorStatsProvider = ({ children }) => {
  // 1. SINGLE STATE OBJECT (Source of Truth)
  const [state, setState] = useState(() => {
    try {
      const raw = Cookies.get(COOKIE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        statsByFilter: parsed.statsByFilter || {},
        filters: parsed.filters || defaultFilters,
        userSettings: parsed.userSettings || defaultUserSettings
      };
    } catch {
      return { statsByFilter: {}, filters: defaultFilters, userSettings: defaultUserSettings };
    }
  });

  // 2. PERSISTENCE EFFECT
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    Cookies.set(COOKIE_KEY, JSON.stringify(state), { expires: 365 });
  }, [state]);

  const filterKey = `${state.filters.dateRange}:${state.filters.viewMode}`;

  // --- INTERNAL HELPER to Init Stats ---
  const ensureStats = (statsMap, fRange, fMode, sourceStats = null) => {
    const key = `${fRange}:${fMode}`;
    const len = getGraphLength(fRange, fMode);
    const existing = statsMap[key];

    // Check existence & validity
    if (!existing || !existing.channelData || existing.channelData.subscriptions.length !== len) {
      const base = sourceStats ? { ...sourceStats } : { ...defaultStats };
      const newChannelData = {};

      defaultChannels.forEach(ch => {
        // If copying from another view, distribute organically. If new, 0s.
        const targetVal = sourceStats ? (base[ch] || 0) : 0;
        newChannelData[ch] = sourceStats ? generateOrganicDistribution(targetVal, len) : Array(len).fill(0);
      });

      // Don't copy Creators/Refunds if just switching view, keep them attached to filter logic or copy?
      // Usually Counts persist across views, so copying is good.

      return {
        ...statsMap,
        [key]: {
          ...base,
          channelData: newChannelData,
          graphData: Array(len).fill(0).map((_, i) =>
            defaultChannels.reduce((sum, ch) => sum + newChannelData[ch][i], 0)
          )
        }
      };
    }
    return statsMap;
  };

  // --- PUBLIC UPDATERS ---

  const updateUserSettings = useCallback((newSettings) => {
    setState(prev => ({
      ...prev,
      userSettings: { ...prev.userSettings, ...newSettings }
    }));
  }, []);

  const setViewMode = useCallback((mode) => {
    setState(prev => {
      const currentKey = `${prev.filters.dateRange}:${prev.filters.viewMode}`;
      const currentStats = prev.statsByFilter[currentKey];

      const newFilters = { ...prev.filters, viewMode: mode };
      const newStatsMap = ensureStats(prev.statsByFilter, newFilters.dateRange, mode, currentStats);

      return { ...prev, filters: newFilters, statsByFilter: newStatsMap };
    });
  }, []);

  const setDateRange = useCallback((range) => {
    setState(prev => {
      const newFilters = { ...prev.filters, dateRange: range };
      // When changing dates, start FRESH (null source), unless you want to copy values
      const newStatsMap = ensureStats(prev.statsByFilter, range, prev.filters.viewMode, null);
      return { ...prev, filters: newFilters, statsByFilter: newStatsMap };
    });
  }, []);

  const updateTotalEarnings = useCallback((value) => {
    setState(prev => {
      const fRange = prev.filters.dateRange;
      const fMode = prev.filters.viewMode;
      const key = `${fRange}:${fMode}`;
      const len = getGraphLength(fRange, fMode);

      const statsMap = ensureStats(prev.statsByFilter, fRange, fMode);
      const updatedStats = recalcFromGrandTotal(statsMap[key], value, len);

      return { ...prev, statsByFilter: { ...statsMap, [key]: updatedStats } };
    });
  }, []);

  const updateChannelValue = useCallback((channel, value) => {
    setState(prev => {
      const fRange = prev.filters.dateRange;
      const fMode = prev.filters.viewMode;
      const key = `${fRange}:${fMode}`;
      const len = getGraphLength(fRange, fMode);

      const statsMap = ensureStats(prev.statsByFilter, fRange, fMode);
      const updatedStats = recalcFromChannelInput(statsMap[key], channel, value, len);

      return { ...prev, statsByFilter: { ...statsMap, [key]: updatedStats } };
    });
  }, []);

  const updateChannelGraphPoint = useCallback((channel, index, value) => {
    setState(prev => {
      const fRange = prev.filters.dateRange;
      const fMode = prev.filters.viewMode;
      const key = `${fRange}:${fMode}`;
      const len = getGraphLength(fRange, fMode);

      const statsMap = ensureStats(prev.statsByFilter, fRange, fMode);
      const updatedStats = recalcFromPointDrag(statsMap[key], channel, index, value, len);

      return { ...prev, statsByFilter: { ...statsMap, [key]: updatedStats } };
    });
  }, []);

  const updateGraphColumn = useCallback((index, value) => {
    setState(prev => {
      const fRange = prev.filters.dateRange;
      const fMode = prev.filters.viewMode;
      const key = `${fRange}:${fMode}`;
      const len = getGraphLength(fRange, fMode);

      const statsMap = ensureStats(prev.statsByFilter, fRange, fMode);
      const updatedStats = recalcFromGraphColumn(statsMap[key], index, value, len);

      return { ...prev, statsByFilter: { ...statsMap, [key]: updatedStats } };
    });
  }, []);

  const updateCreatorsCount = useCallback((value) => {
    setState(prev => {
      const fRange = prev.filters.dateRange;
      const fMode = prev.filters.viewMode;
      const key = `${fRange}:${fMode}`;

      const statsMap = ensureStats(prev.statsByFilter, fRange, fMode);
      const updated = { ...statsMap[key], creatorsCount: value };

      return { ...prev, statsByFilter: { ...statsMap, [key]: updated } };
    });
  }, []);

  const updateRefundedEarnings = useCallback((value) => {
    setState(prev => {
      const fRange = prev.filters.dateRange;
      const fMode = prev.filters.viewMode;
      const key = `${fRange}:${fMode}`;

      const statsMap = ensureStats(prev.statsByFilter, fRange, fMode);
      const updated = { ...statsMap[key], refundedEarnings: value };

      return { ...prev, statsByFilter: { ...statsMap, [key]: updated } };
    });
  }, []);

  const resetStats = useCallback(() => {
    setState(prev => {
      const fRange = prev.filters.dateRange;
      const fMode = prev.filters.viewMode;
      const key = `${fRange}:${fMode}`;
      const len = getGraphLength(fRange, fMode);

      // Just overwrite with default
      const cleanStats = {
        ...defaultStats,
        graphData: Array(len).fill(0),
        channelData: defaultStats.channelData // will need init
      };
      // Re-init channel arrays
      defaultChannels.forEach(ch => cleanStats.channelData[ch] = Array(len).fill(0));

      return { ...prev, statsByFilter: { ...prev.statsByFilter, [key]: cleanStats } };
    });
  }, []);

  // Get current stats slice or fallback
  const currentStats = state.statsByFilter[filterKey] || defaultStats;

  const ctx = {
    stats: currentStats,
    filters: state.filters,
    userSettings: state.userSettings,
    updateTotalEarnings,
    updateChannelValue,
    updateGraphColumn,
    updateChannelGraphPoint,
    updateCreatorsCount,
    updateRefundedEarnings,
    updateUserSettings,
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
