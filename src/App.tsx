// ═══════════════════════════════════════════════════════════════
// BUTTON HUNTER — App Shell (Fixed Abilities & Phase Transitions)
// Orchestrates all screens, global systems, and state
// ═══════════════════════════════════════════════════════════════

import { useEffect, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useMousePosition } from './hooks/useMousePosition';
import { useGameState } from './hooks/useGameState';
import { useAchievements } from './hooks/useAchievements';

import { ArenaBackground } from './components/ui/ArenaBackground';
import { HunterCursor } from './components/ui/HunterCursor';
import { AchievementToast } from './components/ui/AchievementToast';

import { IntroScreen } from './components/screens/IntroScreen';
import { ArenaScreen } from './components/screens/ArenaScreen';
import { VictoryScreen } from './components/screens/VictoryScreen';

import { setSoundEnabled, resumeAudioContext } from './utils/sound';
import { DIFFICULTY_CONFIGS } from './constants';
import type { Difficulty } from './types';

const STORAGE_KEY = 'bh_settings';

interface SimpleSettings {
  difficulty: Difficulty;
  soundEnabled: boolean;
}

function loadSettings(): SimpleSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { difficulty: 'normal', soundEnabled: true };
    return { difficulty: 'normal', soundEnabled: true, ...JSON.parse(raw) };
  } catch {
    return { difficulty: 'normal', soundEnabled: true };
  }
}

function saveSettings(s: SimpleSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function App() {
  const { position: mouse, distanceTraveled } = useMousePosition();
  const {
    stats, phase, setPhase,
    recordFailedClick, recordSuccess,
    updateDistance, resetGame, startGame,
  } = useGameState();
  const {
    achievements, newAchievement, clearNewAchievement, checkAchievements,
  } = useAchievements();

  const [settings, setSettings] = useState<SimpleSettings>(loadSettings);
  const [isFreezeActive, setIsFreezeActive] = useState(false);
  const [isRadarActive, setIsRadarActive] = useState(false);

  const diffConfig = DIFFICULTY_CONFIGS[settings.difficulty];
  const fearRadius = diffConfig.fearRadius;
  const speed      = diffConfig.speed;

  // Keep distance in sync
  useEffect(() => {
    updateDistance(distanceTraveled);
  }, [distanceTraveled, updateDistance]);

  // Check achievements safely on stats change
  useEffect(() => {
    checkAchievements(stats, phase);
  }, [stats.successfulClicks, stats.failedClicks, stats.buttonsHunted, stats.timePlayed, phase, checkAchievements]);

  // Sync sound setting
  useEffect(() => {
    setSoundEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Resume audio context on user interaction
  useEffect(() => {
    const resume = () => resumeAudioContext();
    window.addEventListener('click', resume, { once: true });
    window.addEventListener('keydown', resume, { once: true });
    return () => {
      window.removeEventListener('click', resume);
      window.removeEventListener('keydown', resume);
    };
  }, []);

  const handleChangeDifficulty = useCallback((d: Difficulty) => {
    const next = { ...settings, difficulty: d };
    setSettings(next);
    saveSettings(next);
  }, [settings]);

  const handleStart = useCallback(() => {
    resumeAudioContext();
    startGame();
  }, [startGame]);

  const handleCatch = useCallback((scoreGain: number) => {
    recordSuccess(scoreGain);
  }, [recordSuccess]);

  const handleBossDefeated = useCallback(() => {
    recordSuccess(5000);
    setPhase('victory');
  }, [recordSuccess, setPhase]);

  const handleQuit = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const handlePlayAgain = useCallback(() => {
    resumeAudioContext();
    startGame();
  }, [startGame]);

  const handleMainMenu = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const handleAbilityChange = useCallback((freeze: boolean, radar: boolean) => {
    setIsFreezeActive(freeze);
    setIsRadarActive(radar);
  }, []);

  const chaos = Math.min(1, stats.timePlayed / 60 + (stats.failedClicks / 80) * 0.3);
  const isBoss = phase === 'boss';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#04050f',
      }}
    >
      {/* Always-on background */}
      <ArenaBackground
        chaos={isBoss ? 0.9 : chaos}
        frozen={isFreezeActive}
        isSecret={false}
      />

      {/* Hunter drone cursor */}
      <HunterCursor
        mouse={mouse}
        scanning={phase === 'arena' || phase === 'boss'}
        isFreezeActive={isFreezeActive}
        isRadarActive={isRadarActive}
        empCooldown={1}
        dashCooldown={1}
      />

      {/* Screens */}
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
            transition={{ duration: 0.6 }}
          >
            <IntroScreen
              mouse={mouse}
              difficulty={settings.difficulty}
              onStart={handleStart}
              onChangeDifficulty={handleChangeDifficulty}
            />
          </motion.div>
        )}

        {(phase === 'arena' || phase === 'boss') && (
          <motion.div
            key="arena"
            initial={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
            transition={{ duration: 0.5 }}
          >
            <ArenaScreen
              mouse={mouse}
              stats={stats}
              phase={phase}
              fearRadius={fearRadius}
              speed={speed}
              onCatch={handleCatch}
              onMiss={recordFailedClick}
              onBossDefeated={handleBossDefeated}
              onQuit={handleQuit}
              onAbilityChange={handleAbilityChange}
            />
          </motion.div>
        )}

        {phase === 'victory' && (
          <motion.div
            key="victory"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <VictoryScreen
              stats={stats}
              achievements={achievements}
              onPlayAgain={handlePlayAgain}
              onMainMenu={handleMainMenu}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global achievement toast */}
      <AchievementToast
        achievement={newAchievement}
        onDismiss={clearNewAchievement}
      />
    </div>
  );
}

export default App;
