import { useState, useEffect, useCallback } from 'react';
import { Counter, LogEntry, CounterSession } from '../types.ts';

const STORAGE_KEY = 'ethereal_tally_counters_v2';

// Safe ID generator that doesn't rely on secure context crypto.randomUUID
const generateId = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    try {
      return window.crypto.randomUUID();
    } catch (e) {
      // Fallback if randomUUID fails for some reason
    }
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

export const useCounters = () => {
  const [counters, setCounters] = useState<Counter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Data hardening: Ensure every counter has the necessary arrays
      return Array.isArray(parsed) ? parsed.map(c => ({
        ...c,
        logs: c.logs || [],
        sessions: c.sessions || [],
        count: typeof c.count === 'number' ? c.count : 0
      })) : [];
    } catch (e) {
      console.error("Failed to parse storage", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counters));
  }, [counters]);

  const addCounter = useCallback((counter: Partial<Counter>) => {
    const newCounter: Counter = {
      id: generateId(),
      name: counter.name || 'Untitled Counter',
      count: counter.count || 0,
      goal: counter.goal,
      color: counter.color || '#0F172A',
      icon: counter.icon || 'Circle',
      category: counter.category || 'General',
      createdAt: Date.now(),
      isArchived: false,
      logs: [],
      sessions: [],
      order: (counters || []).length,
      ...counter,
    };
    setCounters(prev => [...(prev || []), newCounter]);
  }, [counters]);

  const updateCounter = useCallback((id: string, updates: Partial<Counter>) => {
    setCounters(prev => (prev || []).map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCounter = useCallback((id: string) => {
    setCounters(prev => (prev || []).filter(c => c.id !== id));
  }, []);

  const clearAllData = useCallback(() => {
    setCounters([]);
  }, []);

  const importData = useCallback((jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data)) {
        setCounters(data.map(c => ({
          ...c,
          logs: c.logs || [],
          sessions: c.sessions || []
        })));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }, []);

  const resetCounter = useCallback((id: string) => {
    setCounters(prev => (prev || []).map(c => {
      if (c.id === id) {
        return {
          ...c,
          count: 0,
          logs: [{
            id: generateId(),
            timestamp: Date.now(),
            increment: -c.count,
            newValue: 0
          }, ...(c.logs || [])].slice(0, 1000)
        };
      }
      return c;
    }));
  }, []);

  const incrementCounter = useCallback((id: string, amount: number = 1) => {
    setCounters(prev => (prev || []).map(c => {
      if (c.id === id) {
        const newValue = (c.count || 0) + amount;
        const log: LogEntry = {
          id: generateId(),
          timestamp: Date.now(),
          increment: amount,
          newValue
        };
        return {
          ...c,
          count: newValue,
          logs: [log, ...(c.logs || [])].slice(0, 1000)
        };
      }
      return c;
    }));
  }, []);

  const decrementCounter = useCallback((id: string, amount: number = 1) => {
    setCounters(prev => (prev || []).map(c => {
      if (c.id === id) {
        const newValue = Math.max(0, (c.count || 0) - amount);
        const log: LogEntry = {
          id: generateId(),
          timestamp: Date.now(),
          increment: -amount,
          newValue
        };
        return {
          ...c,
          count: newValue,
          logs: [log, ...(c.logs || [])].slice(0, 1000)
        };
      }
      return c;
    }));
  }, []);

  const startSession = useCallback((id: string) => {
    setCounters(prev => (prev || []).map(c => {
      if (c.id === id) {
        if (c.activeSessionId) return c;
        const sessionId = generateId();
        const session: CounterSession = {
          id: sessionId,
          startTime: Date.now(),
          startValue: c.count || 0
        };
        return {
          ...c,
          activeSessionId: sessionId,
          sessions: [session, ...(c.sessions || [])]
        };
      }
      return c;
    }));
  }, []);

  const endSession = useCallback((id: string) => {
    setCounters(prev => (prev || []).map(c => {
      if (c.id === id && c.activeSessionId) {
        const sessions = (c.sessions || []).map(s => 
          s.id === c.activeSessionId 
            ? { 
                ...s, 
                endTime: Date.now(), 
                endValue: c.count || 0, 
                duration: Math.floor((Date.now() - s.startTime) / 1000) 
              } 
            : s
        );
        return {
          ...c,
          activeSessionId: undefined,
          sessions
        };
      }
      return c;
    }));
  }, []);

  return {
    counters: counters || [],
    addCounter,
    updateCounter,
    deleteCounter,
    clearAllData,
    importData,
    resetCounter,
    incrementCounter,
    decrementCounter,
    startSession,
    endSession
  };
};