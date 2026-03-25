'use client';

import { useState, useEffect } from 'react';

export interface SearchHistoryItem {
  q: string;
  categoryId?: string;
  sort?: 'newest' | 'popular';
  timestamp: number;
}

const STORAGE_KEY = 'search_history';
const MAX_HISTORY = 15;

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    setTimeout(() => setIsClient(true), 0);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTimeout(() => setHistory(parsed), 0);
      } catch {
        setTimeout(() => setHistory([]), 0);
      }
    }
  }, []);

  const addSearch = (item: Omit<SearchHistoryItem, 'timestamp'>) => {
    setHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter(
        (h) =>
          !(
            h.q === item.q &&
            h.categoryId === item.categoryId &&
            h.sort === item.sort
          )
      );

      // Add new item to the beginning
      const updated = [
        { ...item, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_HISTORY);

      // Persist to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const removeSearch = (index: number) => {
    setHistory((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return {
    history: isClient ? history : [],
    addSearch,
    clearHistory,
    removeSearch,
    isClient,
  };
}
