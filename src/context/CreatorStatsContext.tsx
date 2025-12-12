// @ts-nocheck
import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";

// --- CONSTANTS ---
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
    subscriptions: [], tips: [], posts: [], referrals: [], messages: [], streams: []
  },
  graphData: []
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

// HELPER: Get dynamic range (Last 14 Days)
const getDynamicRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6); // 7 Days default as per previous 7-day req
  const fmt = d => d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
  return `${fmt(start)}_${fmt(end)}`;
};

const defaultFilters = {
  dateRange: getDynamicRange(),
  viewMode: "week",
};

const COOKIE_KEY = "creatorStats_v27"; // Bump

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

// --- HELPERS ---

const fallbackBaseDistribution = {
  subscriptions: 48.31, tips: 76.89, posts: 47.02, referrals: 1.36, messages: 826.42, streams: 0.00
};
const fallbackBaseTotal = 1000.00;

function getDailyLength(dateRange) {
  const [startStr, endStr] = dateRange.split("_");
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function getValidIndices(dateRange, totalLen) {
  const [startStr] = dateRange.split("_");
  const start = new Date(startStr);
  const validIndices = [];
  const today = new Date(); // REAL TODAY
  today.setHours(23,59,59,999);

  for(let i=0; i<totalLen; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    d.setHours(0,0,0,0);
    if (d <= today) {
      validIndices.push(i);
    }
  }
  return validIndices;
}

function generateOrganicDistribution(total, count) {
  if (count <= 0) return [];
  if (total <= 0) return Array(count).fill(0);
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

// --- RECALC LOGIC ---

function recalcFromGrandTotal(currentStats, newTotal, graphLen, dateRange, viewMode) {
  const nextStats = { ...currentStats, channelData: { ...currentStats.channelData } };
  const currentChildrenSum = defaultChannels.reduce((acc, ch) => acc + (currentStats[ch] || 0), 0);
  const channelTargets = {};

  if (newTotal <= 0) defaultChannels.forEach(ch => channelTargets[ch] = 0);
  else if (currentChildrenSum === 0) {
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

  // Distribute across all valid indices in the range
  let validIndices = getValidIndices(dateRange, graphLen);

  // IF WEEK MODE: Filter to ensure money lands in the "Visible Week"
  // But since range is now dynamic (e.g. Last 7 Days), the "Visible Week" IS the range.
  // So we don't need complex filtering unless range > 7 days.
  // Let's assume user wants money in the LAST 7 DAYS of the range if Week View.
  if (viewMode === "week" && graphLen > 7) {
    const startVisible = graphLen - 7;
    validIndices = validIndices.filter(idx => idx >= startVisible);
  }

  const numValid = validIndices.length;
  let actualTotal = 0;

  defaultChannels.forEach(ch => {
    const target = channelTargets[ch];
    nextStats[ch] = target;
    let arr = Array(graphLen).fill(0);
    if (target > 0 && numValid > 0) {
      const validPart = generateOrganicDistribution(target, numValid);
      validIndices.forEach((idx, i) => arr[idx] = validPart[i]);
    }
    nextStats.channelData[ch] = arr;
    actualTotal += target;
  });

  nextStats.total = Number(actualTotal.toFixed(2));
  nextStats.graphData = Array(graphLen).fill(0).map((_, i) =>
    defaultChannels.reduce((sum, ch) => sum + (nextStats.channelData[ch][i] || 0), 0)
  );
  return nextStats;
}

function recalcFromChannelInput(currentStats, channel, newValue, graphLen, dateRange) {
  const nextStats = { ...currentStats, channelData: { ...currentStats.channelData } };
  nextStats[channel] = Number(newValue.toFixed(2));
  const validIndices = getValidIndices(dateRange, graphLen);
  const numValid = validIndices.length;
  let arr = Array(graphLen).fill(0);
  if (numValid > 0 && newValue > 0) {
    const dist = generateOrganicDistribution(newValue, numValid);
    validIndices.forEach((idx, i) => arr[idx] = dist[i]);
  }
  nextStats.channelData[channel] = arr;
  const newTotal = defaultChannels.reduce((sum, ch) => sum + (nextStats[ch] || 0), 0);
  nextStats.total = Number(newTotal.toFixed(2));
  nextStats.graphData = Array(graphLen).fill(0).map((_, i) =>
    defaultChannels.reduce((sum, ch) => sum + (nextStats.channelData[ch][i] || 0), 0)
  );
  return nextStats;
}

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

export const CreatorStatsProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    try {
      const raw = Cookies.get(COOKIE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      // Ensure default range is dynamic if cookie is missing
      const fallbackFilters = { ...defaultFilters, dateRange: getDynamicRange() };
      return {
        statsByFilter: parsed.statsByFilter || {},
        filters: parsed.filters || fallbackFilters,
        userSettings: parsed.userSettings || defaultUserSettings
      };
    } catch {
      return { statsByFilter: {}, filters: { ...defaultFilters, dateRange: getDynamicRange() }, userSettings: defaultUserSettings };
    }
  });

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    Cookies.set(COOKIE_KEY, JSON.stringify(state), { expires: 365 });
  }, [state]);

  const filterKey = `${state.filters.dateRange}`;

  const ensureStats = (statsMap, fRange, sourceStats = null) => {
    const key = `${fRange}`;
    const len = getDailyLength(fRange);
    const existing = statsMap[key];

    if (!existing || !existing.channelData || existing.channelData.subscriptions.length !== len) {
      const base = sourceStats ? { ...sourceStats } : { ...defaultStats };
      const newChannelData = {};
      const validIndices = getValidIndices(fRange, len);
      const numValid = validIndices.length;

      defaultChannels.forEach(ch => {
        const targetVal = sourceStats ? (base[ch] || 0) : 0;
        let arr = Array(len).fill(0);
        if (sourceStats && numValid > 0) {
          const dist = generateOrganicDistribution(targetVal, numValid);
          validIndices.forEach((idx, i) => arr[idx] = dist[i]);
        }
        newChannelData[ch] = arr;
      });

      const graphData = Array(len).fill(0).map((_, i) =>
        defaultChannels.reduce((sum, ch) => sum + newChannelData[ch][i], 0)
      );

      return {
        ...statsMap,
        [key]: {
          ...base,
          channelData: newChannelData,
          graphData,
          creatorsCount: base.creatorsCount || 0,
          refundedEarnings: base.refundedEarnings || 0
        }
      };
    }
    return statsMap;
  };

  const updateUserSettings = useCallback((newSettings) => {
    setState(prev => ({ ...prev, userSettings: { ...prev.userSettings, ...newSettings } }));
  }, []);

  const setViewMode = useCallback((mode) => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, viewMode: mode } }));
  }, []);

  const setDateRange = useCallback((range) => {
    setState(prev => {
      const newFilters = { ...prev.filters, dateRange: range };
      // Copy current stats to new range for continuity
      const currentKey = prev.filters.dateRange;
      const currentStats = prev.statsByFilter[currentKey];

      const newMap = ensureStats(prev.statsByFilter, range, currentStats);
      return { ...prev, filters: newFilters, statsByFilter: newMap };
    });
  }, []);

  const updateTotalEarnings = useCallback((value) => {
    setState(prev => {
      const fRange = prev.filters.dateRange;
      const fMode = prev.filters.viewMode;
      const key = fRange;
      const len = getDailyLength(fRange);
      const map = ensureStats(prev.statsByFilter, fRange);
      const upd = recalcFromGrandTotal(map[key], value, len, fRange, fMode);
      return { ...prev, statsByFilter: { ...map, [key]: upd } };
    });
  }, []);

  const updateChannelValue = useCallback((channel, value) => {
    setState(prev => {
      const fRange = prev.filters.dateRange;
      const key = fRange;
      const len = getDailyLength(fRange);
      const map = ensureStats(prev.statsByFilter, fRange);
      const upd = recalcFromChannelInput(map[key], channel, value, len, fRange);
      return { ...prev, statsByFilter: { ...map, [key]: upd } };
    });
  }, []);

  const updateChannelGraphPoint = useCallback((channel, index, value) => {
    setState(prev => {
      const fRange = prev.filters.dateRange;
      const key = fRange;
      const len = getDailyLength(fRange);
      const map = ensureStats(prev.statsByFilter, fRange);
      const upd = recalcFromPointDrag(map[key], channel, index, value, len);
      return { ...prev, statsByFilter: { ...map, [key]: upd } };
    });
  }, []);

  const updateGraphColumn = useCallback((index, value) => {
    setState(prev => {
      const fRange = prev.filters.dateRange;
      const key = fRange;
      const len = getDailyLength(fRange);
      const map = ensureStats(prev.statsByFilter, fRange);
      const upd = recalcFromGraphColumn(map[key], index, value, len);
      return { ...prev, statsByFilter: { ...map, [key]: upd } };
    });
  }, []);

  const updateCreatorsCount = useCallback((val) => {
    setState(prev => {
      const key = prev.filters.dateRange;
      const map = ensureStats(prev.statsByFilter, key);
      const upd = { ...map[key], creatorsCount: val };
      return { ...prev, statsByFilter: { ...map, [key]: upd } };
    });
  }, []);

  const updateRefundedEarnings = useCallback((val) => {
    setState(prev => {
      const key = prev.filters.dateRange;
      const map = ensureStats(prev.statsByFilter, key);
      const upd = { ...map[key], refundedEarnings: val };
      return { ...prev, statsByFilter: { ...map, [key]: upd } };
    });
  }, []);

  const resetStats = useCallback(() => {
    setState(prev => {
      const key = prev.filters.dateRange;
      const len = getDailyLength(key);
      const clean = { ...defaultStats, graphData: Array(len).fill(0), channelData: defaultStats.channelData };
      defaultChannels.forEach(ch => clean.channelData[ch] = Array(len).fill(0));
      return { ...prev, statsByFilter: { ...prev.statsByFilter, [key]: clean } };
    });
  }, []);

  const currentStats = state.statsByFilter[filterKey] || defaultStats;

  const ctx = {
    stats: currentStats,
    filters: state.filters,
    userSettings: state.userSettings,
    updateTotalEarnings, updateChannelValue, updateGraphColumn, updateChannelGraphPoint,
    updateCreatorsCount, updateRefundedEarnings, updateUserSettings,
    setDateRange, setViewMode, resetStats,
  };

  return <CreatorStatsContext.Provider value={ctx}>{children}</CreatorStatsContext.Provider>;
};
