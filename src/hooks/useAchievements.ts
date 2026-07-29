// ═══════════════════════════════════════════════════════════════
// BUTTON HUNTER — Achievements Hook (updated for new GamePhase)
// ═══════════════════════════════════════════════════════════════

import { useCallback, useState } from 'react';
import type { Achievement, GameStats } from '../types';
import { ACHIEVEMENT_DEFINITIONS } from '../constants';

const STORAGE_KEY = 'bh_achievements';

function loadAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ACHIEVEMENT_DEFINITIONS.map(a => ({ ...a }));
    const saved: { id: string; unlocked: boolean; unlockedAt?: number }[] = JSON.parse(raw);
    return ACHIEVEMENT_DEFINITIONS.map(def => {
      const s = saved.find(x => x.id === def.id);
      return s ? { ...def, unlocked: s.unlocked, unlockedAt: s.unlockedAt } : { ...def };
    });
  } catch {
    return ACHIEVEMENT_DEFINITIONS.map(a => ({ ...a }));
  }
}

function saveAchievements(achievements: Achievement[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(achievements.map(({ id, unlocked, unlockedAt }) => ({ id, unlocked, unlockedAt })))
  );
}

interface UseAchievementsReturn {
  achievements: Achievement[];
  newAchievement: Achievement | null;
  clearNewAchievement: () => void;
  checkAchievements: (stats: GameStats, phase: string) => void;
  resetAchievements: () => void;
}

export function useAchievements(): UseAchievementsReturn {
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  const unlock = useCallback((id: string, current: Achievement[]): Achievement[] => {
    const idx = current.findIndex(a => a.id === id);
    if (idx === -1 || current[idx].unlocked) return current;
    const updated = current.map((a, i) =>
      i === idx ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
    );
    saveAchievements(updated);
    setNewAchievement(updated[idx]);
    return updated;
  }, []);

  const checkAchievements = useCallback((stats: GameStats, phase: string) => {
    setAchievements(prev => {
      let current = [...prev];

      if (stats.buttonsHunted >= 1)   current = unlock('first_blood', current);
      if (stats.comboCount >= 3)      current = unlock('combo_3', current);
      if (stats.comboCount >= 5)      current = unlock('combo_5', current);
      if (stats.failedClicks >= 10)   current = unlock('persistent', current);
      if (stats.distanceTraveled >= 10000) current = unlock('pixel_hunter', current);
      if (phase === 'boss' || phase === 'victory') current = unlock('survivor', current);
      if (phase === 'victory')        current = unlock('boss_slayer', current);

      return current;
    });
  }, [unlock]);

  const clearNewAchievement = useCallback(() => setNewAchievement(null), []);

  const resetAchievements = useCallback(() => {
    const fresh = ACHIEVEMENT_DEFINITIONS.map(a => ({ ...a }));
    saveAchievements(fresh);
    setAchievements(fresh);
  }, []);

  return { achievements, newAchievement, clearNewAchievement, checkAchievements, resetAchievements };
}
