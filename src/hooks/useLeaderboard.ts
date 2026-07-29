// ═══════════════════════════════════════════════════════════════
// BUTTON HUNTER — Leaderboard Hook
// ═══════════════════════════════════════════════════════════════

import { useCallback, useState } from 'react';
import type { LeaderboardEntry } from '../types';

const STORAGE_KEY = 'bh_leaderboard';

function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

interface UseLeaderboardReturn {
  entries: LeaderboardEntry[];
  addEntry: (entry: Omit<LeaderboardEntry, 'id' | 'date'>) => void;
  clearLeaderboard: () => void;
  highestScore: LeaderboardEntry | null;
  fastestVictory: LeaderboardEntry | null;
  fewestMisses: LeaderboardEntry | null;
}

export function useLeaderboard(): UseLeaderboardReturn {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(loadLeaderboard);

  const addEntry = useCallback((entry: Omit<LeaderboardEntry, 'id' | 'date'>) => {
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: Date.now(),
    };
    setEntries(prev => {
      const updated = [newEntry, ...prev].slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearLeaderboard = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setEntries([]);
  }, []);

  const highestScore  = entries.length ? [...entries].sort((a, b) => b.score - a.score)[0] : null;
  const fastestVictory = entries.length ? [...entries].sort((a, b) => a.timeTaken - b.timeTaken)[0] : null;
  const fewestMisses  = entries.length ? [...entries].sort((a, b) => a.failedClicks - b.failedClicks)[0] : null;

  return { entries, addEntry, clearLeaderboard, highestScore, fastestVictory, fewestMisses };
}
