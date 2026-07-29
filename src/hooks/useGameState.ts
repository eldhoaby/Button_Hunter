// ═══════════════════════════════════════════════════════════════
// BUTTON HUNTER — Game State Hook (expanded)
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GamePhase, GameStats } from '../types';
import { BOSS_CHALLENGE_SECONDS } from '../constants';

interface UseGameStateReturn {
  stats: GameStats;
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  recordFailedClick: () => void;
  recordSuccess: (scoreGain?: number) => void;
  recordEscape: () => void;
  updateDistance: (d: number) => void;
  resetGame: () => void;
  startGame: () => void;
  incrementLevel: () => void;
}

const INITIAL_STATS: GameStats = {
  score: 0,
  level: 1,
  buttonsHunted: 0,
  buttonsEscaped: 0,
  timePlayed: 0,
  failedClicks: 0,
  successfulClicks: 0,
  accuracy: 0,
  multiplier: 1,
  comboCount: 0,
  distanceTraveled: 0,
  rageLevel: 0,
};

export function useGameState(): UseGameStateReturn {
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [phase, setPhaseState] = useState<GamePhase>('intro');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setStats(prev => ({ ...prev, timePlayed: prev.timePlayed + 1 }));
    }, 1000);
  }, [stopTimer]);

  const setPhase = useCallback((p: GamePhase) => {
    setPhaseState(p);
    if (p === 'arena') startTimer();
    else stopTimer();
  }, [startTimer, stopTimer]);

  const computeAccuracy = (failed: number, success: number) => {
    const total = failed + success;
    return total === 0 ? 0 : Math.round((success / total) * 100);
  };

  const recordFailedClick = useCallback(() => {
    setStats(prev => ({
      ...prev,
      failedClicks: prev.failedClicks + 1,
      comboCount: 0,
      multiplier: 1,
      accuracy: computeAccuracy(prev.failedClicks + 1, prev.successfulClicks),
      rageLevel: Math.min(100, Math.floor((prev.failedClicks + 1) * 1.2)),
    }));
  }, []);

  const recordSuccess = useCallback((scoreGain = 500) => {
    setStats(prev => {
      const newCombo = prev.comboCount + 1;
      const newMultiplier = Math.min(5, 1 + Math.floor(newCombo / 3) * 0.5);
      const actualGain = Math.round(scoreGain * newMultiplier);
      return {
        ...prev,
        successfulClicks: prev.successfulClicks + 1,
        buttonsHunted: prev.buttonsHunted + 1,
        comboCount: newCombo,
        multiplier: newMultiplier,
        score: prev.score + actualGain,
        accuracy: computeAccuracy(prev.failedClicks, prev.successfulClicks + 1),
      };
    });
  }, []);

  const recordEscape = useCallback(() => {
    setStats(prev => ({
      ...prev,
      buttonsEscaped: prev.buttonsEscaped + 1,
      comboCount: 0,
      multiplier: 1,
    }));
  }, []);

  const updateDistance = useCallback((d: number) => {
    setStats(prev => ({ ...prev, distanceTraveled: d }));
  }, []);

  const resetGame = useCallback(() => {
    stopTimer();
    setStats(INITIAL_STATS);
    setPhaseState('intro');
  }, [stopTimer]);

  const startGame = useCallback(() => {
    stopTimer();
    setStats(INITIAL_STATS);
    setPhaseState('arena');
    startTimer();
  }, [stopTimer, startTimer]);

  const incrementLevel = useCallback(() => {
    setStats(prev => ({ ...prev, level: prev.level + 1 }));
  }, []);

  // Boss trigger
  useEffect(() => {
    if (phase === 'arena' && stats.timePlayed >= BOSS_CHALLENGE_SECONDS) {
      setPhaseState('boss');
    }
  }, [stats.timePlayed, phase]);

  // Cleanup
  useEffect(() => () => stopTimer(), [stopTimer]);

  return {
    stats, phase, setPhase,
    recordFailedClick, recordSuccess, recordEscape,
    updateDistance, resetGame, startGame, incrementLevel,
  };
}
