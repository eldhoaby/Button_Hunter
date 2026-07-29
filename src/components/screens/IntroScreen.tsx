// ═══════════════════════════════════════════════════════════════
// BUTTON HUNTER — Cinematic Intro / Main Menu Screen
// Particles assemble the title; sample buttons run across screen
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PERSONALITY_DATA, DIFFICULTY_CONFIGS } from '../../constants';
import type { Difficulty, MousePosition } from '../../types';
import { startAmbientLoop, stopAmbientLoop } from '../../utils/sound';

interface IntroScreenProps {
  mouse: MousePosition;
  difficulty: Difficulty;
  onStart: () => void;
  onChangeDifficulty: (d: Difficulty) => void;
}

// Title letter animation — each letter assembles from particles
const TitleLetter: React.FC<{ char: string; delay: number; color: string }> = ({ char, delay, color }) => (
  <motion.span
    initial={{ opacity: 0, y: -30, filter: 'blur(20px)', scale: 0.3 }}
    animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
    transition={{ delay, type: 'spring', stiffness: 200, damping: 16 }}
    style={{ display: 'inline-block', color, textShadow: `0 0 20px ${color}, 0 0 60px ${color}40` }}
  >
    {char === ' ' ? '\u00A0' : char}
  </motion.span>
);

// Demo creature running across screen
const DemoCreature: React.FC<{
  emoji: string; color: string; glow: string;
  startX: number; startY: number; delay: number;
}> = ({ emoji, color, glow, startX, startY, delay }) => (
  <motion.div
    initial={{ x: startX, y: startY, opacity: 0 }}
    animate={{
      x: [startX, startX + (Math.random() > 0.5 ? 200 : -200)],
      y: [startY, startY + (Math.random() - 0.5) * 100],
      opacity: [0, 1, 1, 0],
    }}
    transition={{ duration: 3, delay, ease: 'easeInOut', repeat: Infinity, repeatDelay: Math.random() * 5 + 3 }}
    style={{
      position: 'fixed',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 60, height: 36,
      borderRadius: 10,
      background: `${color}15`,
      border: `1px solid ${color}60`,
      fontSize: 18,
      boxShadow: `0 0 10px ${glow}40`,
      zIndex: 5,
    }}
  >
    {emoji}
  </motion.div>
);

const DIFFICULTY_KEYS: Difficulty[] = ['easy', 'normal', 'hard', 'impossible', 'nightmare'];

export const IntroScreen: React.FC<IntroScreenProps> = ({
  mouse,
  difficulty,
  onStart,
  onChangeDifficulty,
}) => {
  const [showContent, setShowContent] = useState(false);
  const [titleDone, setTitleDone] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(false);
  const [showPersonalities, setShowPersonalities] = useState(false);

  const TITLE = 'BUTTON HUNTER';
  const totalLetters = TITLE.length;

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 200);
    const t2 = setTimeout(() => setTitleDone(true), 200 + totalLetters * 80 + 600);
    const t3 = setTimeout(() => setShowPersonalities(true), 200 + totalLetters * 80 + 1200);
    startAmbientLoop();
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      stopAmbientLoop();
    };
  }, [totalLetters]);

  const personalities = Object.entries(PERSONALITY_DATA);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      {/* Demo creatures wandering */}
      {personalities.slice(0, 6).map(([, data], i) => (
        <DemoCreature
          key={i}
          emoji={data.emoji}
          color={data.color}
          glow={data.glow}
          startX={100 + (i * (window.innerWidth / 6)) - 100}
          startY={50 + Math.random() * (window.innerHeight - 200)}
          delay={i * 0.8 + 1}
        />
      ))}

      {/* Parallax depth layer reacting to mouse */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'transparent',
        }}
        animate={{
          x: (mouse.x - window.innerWidth / 2) * -0.01,
          y: (mouse.y - window.innerHeight / 2) * -0.01,
        }}
        transition={{ type: 'spring', stiffness: 30, damping: 20 }}
      >
        {/* Floating orbs */}
        {[
          { x: '15%', y: '20%', color: '#00f5ff20', size: 200 },
          { x: '80%', y: '70%', color: '#9b5de520', size: 160 },
          { x: '60%', y: '15%', color: '#ff008020', size: 120 },
        ].map((orb, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 }}
            style={{
              position: 'absolute',
              left: orb.x, top: orb.y,
              width: orb.size, height: orb.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${orb.color}, transparent)`,
            }}
          />
        ))}
      </motion.div>

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        textAlign: 'center',
        padding: '0 20px',
      }}>

        {/* HUNTER DRONE label */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, letterSpacing: '1em' }}
              animate={{ opacity: 1, letterSpacing: '0.3em' }}
              transition={{ duration: 1 }}
              style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                color: '#00f5ff80',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                marginBottom: -8,
              }}
            >
              ◈ ARENA SYSTEM v2.7 ◈
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main title */}
        <div
          style={{
            fontFamily: 'Orbitron, monospace',
            fontWeight: 900,
            fontSize: 'clamp(2.5rem, 8vw, 7rem)',
            lineHeight: 1,
            letterSpacing: '0.04em',
          }}
        >
          {showContent && TITLE.split('').map((char, i) => (
            <TitleLetter
              key={i}
              char={char}
              delay={i * 0.08}
              color={char === ' ' ? 'transparent' : i < 6 ? '#00f5ff' : '#ff0080'}
            />
          ))}
        </div>

        {/* Tagline */}
        <AnimatePresence>
          {titleDone && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
                color: 'rgba(255,255,255,0.45)',
                letterSpacing: '0.08em',
                maxWidth: 500,
              }}
            >
              Buttons are living organisms. They panic. They flee. They have personalities.
              <br />
              <span style={{ color: 'rgba(0, 245, 255, 0.6)' }}>Hunt them all.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Personality icons preview */}
        <AnimatePresence>
          {showPersonalities && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
            >
              {personalities.map(([key, data], i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 10px',
                    background: `${data.color}10`,
                    border: `1px solid ${data.color}30`,
                    borderRadius: 8,
                    cursor: 'none',
                  }}
                  whileHover={{ scale: 1.1, borderColor: data.color }}
                >
                  <span style={{ fontSize: 16 }}>{data.emoji}</span>
                  <span style={{
                    fontFamily: 'Orbitron, monospace',
                    fontSize: 8,
                    color: data.color,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}>{data.label}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Difficulty selector */}
        <AnimatePresence>
          {titleDone && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
            >
              <div style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: 10,
                letterSpacing: '0.2em',
                color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase',
              }}>
                Select Threat Level
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {DIFFICULTY_KEYS.map((d) => {
                  const cfg = DIFFICULTY_CONFIGS[d];
                  const selected = d === difficulty;
                  return (
                    <motion.button
                      key={d}
                      onClick={() => onChangeDifficulty(d)}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        fontFamily: 'Orbitron, monospace',
                        fontSize: 9,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: `1px solid ${selected ? cfg.color : cfg.color + '40'}`,
                        background: selected ? `${cfg.color}20` : 'transparent',
                        color: selected ? cfg.color : `${cfg.color}80`,
                        cursor: 'none',
                        transition: 'all 0.2s',
                        boxShadow: selected ? `0 0 12px ${cfg.color}40` : 'none',
                      }}
                    >
                      {cfg.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* START button */}
        <AnimatePresence>
          {titleDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 200, damping: 18 }}
            >
              <motion.button
                onClick={onStart}
                onHoverStart={() => setHoveredBtn(true)}
                onHoverEnd={() => setHoveredBtn(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                animate={hoveredBtn ? {
                  boxShadow: ['0 0 20px #00f5ff40', '0 0 40px #00f5ff80', '0 0 20px #00f5ff40'],
                } : {
                  boxShadow: '0 0 20px #00f5ff20',
                }}
                transition={{ duration: 0.8, repeat: hoveredBtn ? Infinity : 0 }}
                style={{
                  fontFamily: 'Orbitron, monospace',
                  fontWeight: 900,
                  fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  padding: '18px 60px',
                  borderRadius: 8,
                  border: '2px solid #00f5ff',
                  background: 'rgba(0, 245, 255, 0.1)',
                  color: '#00f5ff',
                  cursor: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Scan shimmer */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.2), transparent)',
                    pointerEvents: 'none',
                  }}
                />
                ▶ BEGIN HUNT
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions hint */}
        <AnimatePresence>
          {titleDone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1.5 }}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.05em',
                textAlign: 'center',
              }}
            >
              Click the buttons to capture them · Space = EMP · Shift = Freeze · Alt = Radar
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Corner HUD decorations */}
      {['tl', 'tr', 'bl', 'br'].map((corner) => (
        <motion.div
          key={corner}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1 }}
          style={{
            position: 'fixed',
            top:    corner.startsWith('t') ? 20 : undefined,
            bottom: corner.startsWith('b') ? 20 : undefined,
            left:   corner.endsWith('l')  ? 20 : undefined,
            right:  corner.endsWith('r')  ? 20 : undefined,
            width: 40, height: 40,
            borderTop:    corner.startsWith('t') ? '1px solid #00f5ff60' : 'none',
            borderBottom: corner.startsWith('b') ? '1px solid #00f5ff60' : 'none',
            borderLeft:   corner.endsWith('l')   ? '1px solid #00f5ff60' : 'none',
            borderRight:  corner.endsWith('r')   ? '1px solid #00f5ff60' : 'none',
          }}
        />
      ))}

      {/* Version watermark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ delay: 2 }}
        style={{
          position: 'fixed',
          bottom: 16,
          right: 20,
          fontFamily: 'Orbitron, monospace',
          fontSize: 9,
          letterSpacing: '0.15em',
          color: '#00f5ff',
          textTransform: 'uppercase',
        }}
      >
        SYSTEM v2.7.0
      </motion.div>
    </div>
  );
};
