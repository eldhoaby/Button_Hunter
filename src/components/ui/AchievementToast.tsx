// ═══════════════════════════════════════════════════════════════
// BUTTON HUNTER — Cinematic Achievement Toast
// Emerges from particle cloud, not a boring popup
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Achievement } from '../../types';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onDismiss,
}) => {
  if (!achievement) return null;

  // Auto dismiss
  React.useEffect(() => {
    if (!achievement) return;
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [achievement, onDismiss]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, y: 80, scale: 0.6, filter: 'blur(20px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -60, scale: 0.8, filter: 'blur(10px)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          style={{
            position: 'fixed',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9000,
            cursor: 'none',
          }}
          onClick={onDismiss}
        >
          {/* Particle ring */}
          <div style={{ position: 'absolute', inset: -20, pointerEvents: 'none' }}>
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: Math.cos(angle) * 40,
                    y: Math.sin(angle) * 20,
                  }}
                  transition={{ duration: 0.8, delay: i * 0.04 }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 4, height: 4,
                    borderRadius: '50%',
                    background: '#ffaa00',
                    boxShadow: '0 0 6px #ffaa00',
                    marginTop: -2,
                    marginLeft: -2,
                  }}
                />
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 24px',
              background: 'rgba(0, 10, 20, 0.92)',
              border: '1px solid rgba(255, 170, 0, 0.5)',
              borderRadius: 12,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 30px rgba(255, 170, 0, 0.25), 0 20px 40px rgba(0,0,0,0.5)',
              minWidth: 260,
            }}
          >
            {/* Icon */}
            <motion.div
              animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ fontSize: 28, lineHeight: 1 }}
            >
              {achievement.icon}
            </motion.div>

            {/* Text */}
            <div>
              <div style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: 10,
                letterSpacing: '0.15em',
                color: '#ffaa00',
                textTransform: 'uppercase',
                marginBottom: 2,
              }}>
                Achievement Unlocked
              </div>
              <div style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: 14,
                fontWeight: 700,
                color: '#fff',
                marginBottom: 2,
              }}>
                {achievement.title}
              </div>
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
              }}>
                {achievement.description}
              </div>
            </div>

            {/* Corner glow */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: 30, height: 30,
                background: 'radial-gradient(circle at top left, rgba(255,170,0,0.3), transparent)',
                borderRadius: '12px 0 0 0',
                pointerEvents: 'none',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
