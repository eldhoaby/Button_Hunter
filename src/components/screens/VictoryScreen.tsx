// ═══════════════════════════════════════════════════════════════
// BUTTON HUNTER — Victory Screen
// Digital organism souls fly upward; score materializes
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Achievement, GameStats } from '../../types';
import { playVictorySound } from '../../utils/sound';

interface VictoryScreenProps {
  stats: GameStats;
  achievements: Achievement[];
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

// Floating soul particle
const Soul: React.FC<{ x: number; color: string; delay: number; emoji: string }> = ({ x, color, delay, emoji }) => (
  <motion.div
    initial={{ x, y: '100vh', opacity: 0, scale: 0.5, rotate: Math.random() * 20 - 10 }}
    animate={{
      y: '-20vh',
      opacity: [0, 1, 1, 0],
      scale: [0.5, 1, 0.8, 0.3],
      x: [x, x + (Math.random() - 0.5) * 100, x + (Math.random() - 0.5) * 60],
      rotate: [0, 15, -10, 5],
    }}
    transition={{ duration: 3 + Math.random() * 2, delay, ease: 'easeOut' }}
    style={{
      position: 'fixed',
      fontSize: 24,
      filter: `drop-shadow(0 0 8px ${color})`,
      pointerEvents: 'none',
      zIndex: 50,
    }}
  >
    {emoji}
  </motion.div>
);

const StatRow: React.FC<{ label: string; value: string; color?: string; delay?: number }> = ({ label, value, color = '#00f5ff', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid rgba(0,245,255,0.08)',
    }}
  >
    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{label}</span>
    <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 14, fontWeight: 700, color, textShadow: `0 0 8px ${color}` }}>{value}</span>
  </motion.div>
);

const SOUL_EMOJIS = ['😨', '🥷', '🃏', '👻', '🪄', '🛡️', '👑', '🍼', '🎯'];
const SOUL_COLORS = ['#00f5ff', '#95a5a6', '#9b5de5', '#ecf0f1', '#f39c12', '#e74c3c', '#f1c40f', '#ff9ff3', '#ff0080'];

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  stats, achievements, onPlayAgain, onMainMenu,
}) => {
  const [showContent, setShowContent] = useState(false);
  const [scoreVisible, setScoreVisible] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const unlockedAchievements = achievements.filter(a => a.unlocked);

  const mins = Math.floor(stats.timePlayed / 60);
  const secs = stats.timePlayed % 60;

  useEffect(() => {
    playVictorySound();
    const t1 = setTimeout(() => setShowContent(true), 800);
    const t2 = setTimeout(() => {
      setScoreVisible(true);
      // Count up score
      let current = 0;
      const target = stats.score;
      const step = target / 60;
      const interval = setInterval(() => {
        current = Math.min(target, current + step);
        setDisplayScore(Math.round(current));
        if (current >= target) clearInterval(interval);
      }, 30);
    }, 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [stats.score]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      overflow: 'hidden',
    }}>
      {/* Soul particles flying up */}
      {SOUL_EMOJIS.map((emoji, i) => (
        <Soul
          key={i}
          emoji={emoji}
          color={SOUL_COLORS[i]}
          x={80 + (i / SOUL_EMOJIS.length) * (window.innerWidth - 160)}
          delay={i * 0.2}
        />
      ))}
      {/* Second wave */}
      {SOUL_EMOJIS.map((emoji, i) => (
        <Soul
          key={`b-${i}`}
          emoji={emoji}
          color={SOUL_COLORS[i]}
          x={40 + (i / SOUL_EMOJIS.length) * (window.innerWidth - 80)}
          delay={i * 0.3 + 1.5}
        />
      ))}

      {/* Main panel */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              background: 'rgba(0, 8, 20, 0.92)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              borderRadius: 20,
              padding: '40px 48px',
              maxWidth: 480,
              width: '90%',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 0 60px rgba(0, 255, 136, 0.15), 0 40px 80px rgba(0,0,0,0.6)',
              position: 'relative',
              zIndex: 100,
            }}
          >
            {/* Corner decor */}
            <div className="hud-corner hud-corner-tl" style={{ borderColor: '#00ff88' }} />
            <div className="hud-corner hud-corner-tr" style={{ borderColor: '#00ff88' }} />
            <div className="hud-corner hud-corner-bl" style={{ borderColor: '#00ff88' }} />
            <div className="hud-corner hud-corner-br" style={{ borderColor: '#00ff88' }} />

            {/* Victory label */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: 11,
                letterSpacing: '0.3em',
                color: '#00ff88',
                textTransform: 'uppercase',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              ◈ HUNT COMPLETE ◈
            </motion.div>

            {/* Big score */}
            <motion.div
              animate={scoreVisible ? { scale: [0.8, 1.05, 1] } : {}}
              style={{
                fontFamily: 'Orbitron, monospace',
                fontWeight: 900,
                fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                color: '#00f5ff',
                textShadow: '0 0 20px #00f5ff, 0 0 60px #00f5ff40',
                textAlign: 'center',
                marginBottom: 8,
                letterSpacing: '0.05em',
              }}
            >
              {displayScore.toLocaleString()}
            </motion.div>
            <div style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: 10,
              letterSpacing: '0.2em',
              color: 'rgba(0,245,255,0.4)',
              textAlign: 'center',
              marginBottom: 28,
            }}>
              FINAL SCORE
            </div>

            {/* Stats */}
            <div style={{ marginBottom: 24 }}>
              <StatRow label="Buttons Hunted"   value={String(stats.buttonsHunted)} color="#00ff88" delay={0.2} />
              <StatRow label="Time Played"       value={`${mins}m ${secs}s`} color="#ffaa00" delay={0.3} />
              <StatRow label="Accuracy"          value={`${stats.accuracy}%`} color={stats.accuracy > 70 ? '#00ff88' : '#ff0080'} delay={0.4} />
              <StatRow label="Best Combo"        value={`×${stats.multiplier.toFixed(1)}`} color="#9b5de5" delay={0.5} />
            </div>

            {/* Achievements earned */}
            {unlockedAchievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                style={{ marginBottom: 24 }}
              >
                <div style={{
                  fontFamily: 'Orbitron, monospace',
                  fontSize: 9,
                  letterSpacing: '0.2em',
                  color: '#ffaa00',
                  marginBottom: 10,
                }}>
                  ACHIEVEMENTS EARNED
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {unlockedAchievements.map((a, i) => (
                    <motion.span
                      key={a.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 + i * 0.08, type: 'spring' }}
                      style={{
                        fontSize: 18,
                        filter: 'drop-shadow(0 0 4px #ffaa00)',
                      }}
                      title={a.title}
                    >
                      {a.icon}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <motion.button
                onClick={onPlayAgain}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  flex: 1,
                  fontFamily: 'Orbitron, monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  padding: '14px 0',
                  borderRadius: 8,
                  border: '2px solid #00ff88',
                  background: 'rgba(0, 255, 136, 0.1)',
                  color: '#00ff88',
                  cursor: 'none',
                  boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)',
                }}
              >
                ▶ HUNT AGAIN
              </motion.button>
              <motion.button
                onClick={onMainMenu}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  flex: 1,
                  fontFamily: 'Orbitron, monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  padding: '14px 0',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'none',
                }}
              >
                MAIN MENU
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
