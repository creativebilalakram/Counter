
import { useState, useEffect, useCallback } from 'react';
import { Counter, LogEntry, CounterSession } from '../types';

const STORAGE_KEY = 'ethereal_tally_counters';

export const useCounters = () => {
  const [counters, setCounters] = useState<Counter[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counters));
  }, [counters]);

  const addCounter = useCallback((counter: Partial<Counter>) => {
    const newCounter: Counter = {
      id: crypto.randomUUID(),
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
      order: counters.length,
      ...counter,
    };
    setCounters(prev => [...prev, newCounter]);
  }, [counters.length]);

  const updateCounter = useCallback((id: string, updates: Partial<Counter>) => {
    setCounters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCounter = useCallback((id: string) => {
    setCounters(prev => prev.filter(c => c.id !== id));
  }, []);

  const clearAllData = useCallback(() => {
    if (confirm("Are you absolutely sure? This will delete all counters and history forever.")) {
      setCounters([]);
    }
  }, []);

  const archiveCounter = useCallback((id: string) => {
    setCounters(prev => prev.map(c => c.id === id ? { ...c, isArchived: true } : c));
  }, []);

  const resetCounter = useCallback((id: string) => {
    setCounters(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          count: 0,
          logs: [{
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            increment: -c.count,
            newValue: 0
          }, ...c.logs]
        };
      }
      return c;
    }));
  }, []);

  const incrementCounter = useCallback((id: string, amount: number = 1) => {
    setCounters(prev => prev.map(c => {
      if (c.id === id) {
        const newValue = c.count + amount;
        const log: LogEntry = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          increment: amount,
          newValue
        };
        return {
          ...c,
          count: newValue,
          logs: [log, ...c.logs].slice(0, 1000)
        };
      }
      return c;
    }));
  }, []);

  const decrementCounter = useCallback((id: string, amount: number = 1) => {
    setCounters(prev => prev.map(c => {
      if (c.id === id) {
        const newValue = Math.max(0, c.count - amount);
        const log: LogEntry = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          increment: -amount,
          newValue
        };
        return {
          ...c,
          count: newValue,
          logs: [log, ...c.logs].slice(0, 1000)
        };
      }
      return c;
    }));
  }, []);

  return {
    counters,
    addCounter,
    updateCounter,
    deleteCounter,
    clearAllData,
    archiveCounter,
    resetCounter,
    incrementCounter,
    decrementCounter,
  };
};
