// ═══════════════════════════════════════════════════════════════
// BUTTON HUNTER — Secret Event Overlay
// Rare cinematic moments that make the game feel sentient
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SecretEvent } from '../../types';
import { playSecretSound } from '../../utils/sound';

interface SecretEventOverlayProps {
  event: SecretEvent | null;
  onEnd: () => void;
}

export const SecretEventOverlay: React.FC<SecretEventOverlayProps> = ({ event, onEnd }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!event || !event.active) return;
    setVisible(true);
    playSecretSound();
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onEnd, 800);
    }, event.duration * 1000);
    return () => clearTimeout(t);
  }, [event, onEnd]);

  if (!event) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={event.type}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 8000,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Darkening vignette */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.4, 0.6] }}
            transition={{ duration: event.duration, repeat: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.8) 100%)',
            }}
          />

          {/* Eyes staring overlay */}
          {event.type === 'stare' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 40,
              padding: 60,
              opacity: 0.15,
            }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.4 }}
                  transition={{ delay: i * 0.12, duration: 0.4 }}
                  style={{
                    width: 24, height: 24,
                    background: '#fff',
                    borderRadius: '50%',
                    boxShadow: '0 0 10px rgba(255,255,255,0.8)',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 10, height: 10,
                    background: '#000',
                    borderRadius: '50%',
                  }} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Whisper text */}
          {event.type === 'whisper' && event.message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, letterSpacing: '0.5em' }}
              animate={{ opacity: [0, 0.9, 0.7, 0.9, 0], scale: [0.7, 1, 0.98, 1, 1.1], letterSpacing: ['0.5em', '0.1em', '0.15em', '0.1em', '0.6em'] }}
              transition={{ duration: event.duration, ease: 'easeInOut' }}
              style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                fontWeight: 900,
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                textShadow: '0 0 20px rgba(0,245,255,0.5), 0 0 60px rgba(0,245,255,0.2)',
                letterSpacing: '0.1em',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {event.message}
            </motion.div>
          )}

          {/* Glitch effect */}
          {event.type === 'glitch' && (
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'transparent',
                animation: 'secret-glitch 0.5s ease-in-out 3',
              }}
            />
          )}

          {/* Golden button announcement */}
          {event.type === 'golden_button' && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: 'clamp(1rem, 3vw, 2rem)',
                color: '#ffd700',
                textAlign: 'center',
                textShadow: '0 0 20px #ffd700, 0 0 60px rgba(255,215,0,0.5)',
                letterSpacing: '0.15em',
                position: 'relative',
                zIndex: 1,
              }}
            >
              ✦ A GOLDEN ONE APPEARS ✦
            </motion.div>
          )}

          {/* Scan lines effect for all events */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{ duration: 1, repeat: Math.floor(event.duration) }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,245,255,0.03) 3px, rgba(0,245,255,0.03) 4px)',
              pointerEvents: 'none',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
