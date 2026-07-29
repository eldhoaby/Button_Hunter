// ═══════════════════════════════════════════════════════════════
// BUTTON HUNTER — Arena Screen (Main Gameplay - Fixed Loop & Abilities)
// Full-screen digital arena with living button organisms
// ═══════════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ButtonCreatureState, ButtonPersonality, GamePhase, GameStats, MousePosition, SecretEvent } from '../../types';
import { LEVEL_CONFIGS, SECRET_WHISPERS, MISS_MESSAGES } from '../../constants';
import { updateButtonAI, createButtonCreature } from '../../utils/buttonAI';
import { distance } from '../../utils/physics';
import { playMissSound, playCaptureSound, playEMPSound, playFreezeSound, resumeAudioContext } from '../../utils/sound';
import { ButtonCreature } from '../buttons/ButtonCreature';
import { SecretEventOverlay } from '../ui/SecretEventOverlay';

const BTN_W = 90;
const BTN_H = 54;

interface ArenaScreenProps {
  mouse: MousePosition;
  stats: GameStats;
  phase: GamePhase;
  fearRadius: number;
  speed: number;
  onCatch: (scoreGain: number) => void;
  onMiss: () => void;
  onBossDefeated: () => void;
  onQuit: () => void;
  onAbilityChange?: (freeze: boolean, radar: boolean) => void;
}

const HUDPanel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      background: 'rgba(0, 10, 25, 0.75)',
      border: '1px solid rgba(0, 245, 255, 0.2)',
      borderRadius: 10,
      backdropFilter: 'blur(16px)',
      padding: '8px 16px',
      position: 'relative',
      ...style,
    }}
  >
    <div className="hud-corner hud-corner-tl" />
    <div className="hud-corner hud-corner-tr" />
    <div className="hud-corner hud-corner-bl" />
    <div className="hud-corner hud-corner-br" />
    {children}
  </motion.div>
);

const StatLabel: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = '#00f5ff' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 8, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 16, fontWeight: 700, color, textShadow: `0 0 8px ${color}` }}>{value}</div>
  </div>
);

export const ArenaScreen: React.FC<ArenaScreenProps> = ({
  mouse, stats, phase, fearRadius, speed,
  onCatch, onMiss, onBossDefeated, onQuit, onAbilityChange,
}) => {
  const [creatures, setCreatures] = useState<ButtonCreatureState[]>([]);
  const [frozen, setFrozen] = useState(false);
  const [radarActive, setRadarActive] = useState(false);
  const [secretEvent, setSecretEvent] = useState<SecretEvent | null>(null);
  const [missFlash, setMissFlash] = useState<{ text: string; x: number; y: number; id: number } | null>(null);
  const [catchFlash, setCatchFlash] = useState<{ x: number; y: number; id: number; multiplier: number } | null>(null);
  const [currentLevel] = useState(1);
  const [bossHp, setBossHp] = useState(5);
  const [empActive, setEmpActive] = useState(false);

  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const creaturesRef = useRef<ButtonCreatureState[]>([]);
  const frozenRef = useRef(false);
  const mouseRef = useRef(mouse);
  const secretTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const missFlashId = useRef(0);
  const catchFlashId = useRef(0);

  mouseRef.current = mouse;
  creaturesRef.current = creatures;
  frozenRef.current = frozen;

  const levelConfig = LEVEL_CONFIGS[Math.min(currentLevel - 1, LEVEL_CONFIGS.length - 1)];

  // Notify parent of freeze/radar state changes
  useEffect(() => {
    onAbilityChange?.(frozen, radarActive);
  }, [frozen, radarActive, onAbilityChange]);

  // ── Initial spawn ─────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'arena') {
      const initial: ButtonCreatureState[] = [];
      const personalities = levelConfig.personalities as unknown as ButtonPersonality[];
      for (let i = 0; i < Math.min(3, levelConfig.buttonsToHunt); i++) {
        const p = personalities[i % personalities.length];
        initial.push(createButtonCreature(p));
      }
      setCreatures(initial);

      spawnTimerRef.current = setInterval(() => {
        setCreatures(prev => {
          if (prev.length >= 7) return prev;
          const p = personalities[Math.floor(Math.random() * personalities.length)];
          return [...prev, createButtonCreature(p)];
        });
      }, levelConfig.spawnRate * 1000);
    }

    if (phase === 'boss') {
      setCreatures([createButtonCreature('tank')]);
      setBossHp(5);
    }

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [phase, currentLevel, levelConfig]);

  // ── AI Game Loop (Continuous 60 FPS) ─────────────────────────
  useEffect(() => {
    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;
      const currentMouse = mouseRef.current;

      if (!frozenRef.current) {
        setCreatures(prev =>
          prev.map(b => {
            if (b.emotion === 'caught') return b;
            const updates = updateButtonAI(b, currentMouse.x, currentMouse.y, fearRadius, speed, dt, prev, false);
            const newTrail = [
              { x: b.x + BTN_W / 2, y: b.y + BTN_H / 2, age: 1 },
              ...b.trailPoints,
            ]
              .map(pt => ({ ...pt, age: pt.age - dt * 1.5 }))
              .filter(pt => pt.age > 0)
              .slice(0, 10);
            return { ...b, ...updates, trailPoints: newTrail };
          })
        );
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fearRadius, speed]); // Run once when mounted, using mouseRef inside!

  // ── Secret event scheduler ────────────────────────────────────
  useEffect(() => {
    const scheduleSecret = () => {
      const delay = 15000 + Math.random() * 35000;
      secretTimerRef.current = setTimeout(() => {
        const rand = Math.random();
        const eventType = rand < 0.3 ? 'stare'
          : rand < 0.6 ? 'whisper'
          : rand < 0.8 ? 'glitch'
          : 'golden_button';
        const message = SECRET_WHISPERS[Math.floor(Math.random() * SECRET_WHISPERS.length)];
        setSecretEvent({
          type: eventType,
          message,
          duration: 3,
          active: true,
        });
        scheduleSecret();
      }, delay);
    };

    if (phase === 'arena') scheduleSecret();
    return () => {
      if (secretTimerRef.current) clearTimeout(secretTimerRef.current);
    };
  }, [phase]);

  // ── Keyboard abilities ────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      resumeAudioContext();

      // EMP: Space or E key
      if (e.code === 'Space' || e.key === ' ' || e.key.toLowerCase() === 'e') {
        e.preventDefault();
        playEMPSound();
        setEmpActive(true);
        const currentMouse = mouseRef.current;

        setCreatures(prev => prev.map(b => {
          const cx = b.x + BTN_W / 2;
          const cy = b.y + BTN_H / 2;
          const dist = distance(cx, cy, currentMouse.x, currentMouse.y);
          if (dist < 320) return { ...b, vx: 0, vy: 0, emotion: 'cornered' as const, panicLevel: 1 };
          return b;
        }));
        setTimeout(() => setEmpActive(false), 700);
      }

      // FREEZE: Shift key
      if (e.key === 'Shift' || e.shiftKey || e.key.toLowerCase() === 'f') {
        playFreezeSound();
        setFrozen(true);
        setTimeout(() => setFrozen(false), 3000);
      }

      // RADAR: Alt key
      if (e.key === 'Alt' || e.altKey || e.key.toLowerCase() === 'r') {
        setRadarActive(true);
        setTimeout(() => setRadarActive(false), 4000);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // ── Background click = miss ───────────────────────────────────
  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    // If the click was inside a creature (or any of its children), don't count as miss
    const target = e.target as HTMLElement;
    if (target.closest && target.closest('[data-creature]')) return;
    playMissSound();
    onMiss();
    const id = ++missFlashId.current;
    const msg = MISS_MESSAGES[Math.floor(Math.random() * MISS_MESSAGES.length)];
    setMissFlash({ text: msg, x: e.clientX, y: e.clientY, id });
    setTimeout(() => setMissFlash(prev => prev?.id === id ? null : prev), 1200);
  }, [onMiss]);

  // ── Button creature click ─────────────────────────────────────
  const handleCreatureClick = useCallback((id: string, isFake: boolean) => {
    resumeAudioContext();

    if (isFake) {
      playMissSound();
      onMiss();
      setCreatures(prev => prev.filter(b => b.id !== id));
      return;
    }

    setCreatures(prev => {
      const target = prev.find(b => b.id === id);
      if (!target) return prev;

      const newHp = target.hp - 1;
      if (newHp <= 0) {
        playCaptureSound();
        const scoreGain = 500 * (target.maxHp) * (target.personality === 'hunter' ? 2 : 1);
        onCatch(scoreGain);

        const id2 = ++catchFlashId.current;
        setCatchFlash({ x: target.x + BTN_W / 2, y: target.y + BTN_H / 2, id: id2, multiplier: stats.multiplier });
        setTimeout(() => setCatchFlash(prev => prev?.id === id2 ? null : prev), 900);

        if (target.personality === 'trickster' && Math.random() < 0.6) {
          const fakes = [0, 1].map(() => {
            const fake = createButtonCreature('trickster', true);
            return { ...fake, x: target.x + (Math.random() - 0.5) * 120, y: target.y + (Math.random() - 0.5) * 80 };
          });
          setTimeout(() => {
            setCreatures(c => [...c.filter(b => b.id !== id), ...fakes]);
          }, 100);
          return prev.filter(b => b.id !== id);
        }

        return prev.filter(b => b.id !== id);
      } else {
        playCaptureSound();
        return prev.map(b => b.id === id ? { ...b, hp: newHp } : b);
      }
    });
  }, [onCatch, onMiss, stats.multiplier]);

  // Boss mode: boss takes hits
  const handleBossClick = useCallback((_id: string) => {
    resumeAudioContext();
    playCaptureSound();
    setBossHp(prev => {
      const newHp = prev - 1;
      if (newHp <= 0) {
        setCreatures([]);
        onBossDefeated();
      }
      return newHp;
    });
  }, [onBossDefeated]);

  const isBoss = phase === 'boss';
  const hunted = stats.buttonsHunted;
  const timeLeft = Math.max(0, 60 - stats.timePlayed);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        zIndex: 10,
      }}
      onClick={handleBackgroundClick}
    >
      {/* EMP shockwave */}
      <AnimatePresence>
        {empActive && (
          <motion.div
            key="emp"
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 10, opacity: 0 }}
            exit={{}}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              left: mouse.x - 40,
              top:  mouse.y - 40,
              width: 80, height: 80,
              borderRadius: '50%',
              border: '4px solid #ff0080',
              boxShadow: '0 0 40px #ff0080, 0 0 80px #ff0080',
              pointerEvents: 'none',
              zIndex: 500,
            }}
          />
        )}
      </AnimatePresence>

      {/* Secret event overlay */}
      <SecretEventOverlay
        event={secretEvent}
        onEnd={() => setSecretEvent(null)}
      />

      {/* Miss flash */}
      <AnimatePresence>
        {missFlash && (
          <motion.div
            key={missFlash.id}
            initial={{ opacity: 1, scale: 1, y: 0 }}
            animate={{ opacity: 0, scale: 1.3, y: -30 }}
            transition={{ duration: 1.2 }}
            style={{
              position: 'fixed',
              left: missFlash.x - 40,
              top:  missFlash.y - 20,
              fontFamily: 'Orbitron, monospace',
              fontSize: 14,
              fontWeight: 700,
              color: '#ff0080',
              textShadow: '0 0 10px #ff0080',
              pointerEvents: 'none',
              zIndex: 1000,
              letterSpacing: '0.1em',
            }}
          >
            {missFlash.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Catch flash */}
      <AnimatePresence>
        {catchFlash && (
          <motion.div
            key={catchFlash.id}
            initial={{ opacity: 1, scale: 0.8, y: 0 }}
            animate={{ opacity: 0, scale: 1.5, y: -40 }}
            transition={{ duration: 0.9 }}
            style={{
              position: 'fixed',
              left: catchFlash.x - 40,
              top:  catchFlash.y - 20,
              fontFamily: 'Orbitron, monospace',
              fontSize: 16,
              fontWeight: 900,
              color: '#00ff88',
              textShadow: '0 0 15px #00ff88, 0 0 30px #00ff8880',
              pointerEvents: 'none',
              zIndex: 1000,
              textAlign: 'center',
              width: 80,
            }}
          >
            +500
            {catchFlash.multiplier > 1 && (
              <div style={{ fontSize: 10, color: '#ffaa00', marginTop: 2 }}>
                ×{catchFlash.multiplier.toFixed(1)} COMBO
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button creatures */}
      {creatures.map(creature => (
        <div key={creature.id} data-creature="true">
          <ButtonCreature
            creature={creature}
            mouseX={mouse.x}
            mouseY={mouse.y}
            fearRadius={fearRadius}
            frozen={frozen}
            onClick={isBoss ? handleBossClick : handleCreatureClick}
          />
        </div>
      ))}

      {/* Top HUD */}
      <div style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
      }}>
        <HUDPanel>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <StatLabel label="Score" value={stats.score.toLocaleString()} color="#00f5ff" />
            <div style={{ width: 1, height: 30, background: 'rgba(0,245,255,0.2)' }} />
            <StatLabel label="Captured" value={hunted} color="#00ff88" />
            <div style={{ width: 1, height: 30, background: 'rgba(0,245,255,0.2)' }} />
            <StatLabel
              label={isBoss ? 'Boss HP' : 'Time'}
              value={isBoss ? `${bossHp}/5` : `${timeLeft}s`}
              color={timeLeft < 10 && !isBoss ? '#ff0080' : '#ffaa00'}
            />
            {stats.multiplier > 1 && (
              <>
                <div style={{ width: 1, height: 30, background: 'rgba(0,245,255,0.2)' }} />
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.3, repeat: Infinity }}>
                  <StatLabel label="Combo" value={`×${stats.multiplier.toFixed(1)}`} color="#ff0080" />
                </motion.div>
              </>
            )}
          </div>
        </HUDPanel>
      </div>

      {/* Top right */}
      <div style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'flex-end',
      }}>
        <HUDPanel>
          <div style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: 10,
            letterSpacing: '0.15em',
            color: isBoss ? '#ff0080' : '#00f5ff',
            textShadow: isBoss ? '0 0 10px #ff0080' : '0 0 8px #00f5ff',
          }}>
            {isBoss ? '⚠ BOSS ENCOUNTER' : `LEVEL ${currentLevel}`}
          </div>
        </HUDPanel>
        <button
          onClick={(e) => { e.stopPropagation(); onQuit(); }}
          style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: 9,
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            padding: '6px 12px',
            cursor: 'none',
            transition: 'all 0.2s',
          }}
        >
          ABORT HUNT
        </button>
      </div>

      {/* Bottom left — abilities hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1 }}
        style={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          zIndex: 200,
          display: 'flex',
          gap: 8,
        }}
      >
        {[
          { key: 'SPACE / E', label: 'EMP', active: empActive, color: '#ff0080' },
          { key: 'SHIFT / F', label: 'FREEZE', active: frozen, color: '#88ccff' },
          { key: 'ALT / R', label: 'RADAR', active: radarActive, color: '#00ff88' },
        ].map(({ key, label, active, color }) => (
          <div key={key} style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: 9,
            letterSpacing: '0.1em',
            color: active ? '#fff' : color,
            border: `1px solid ${active ? color : color + '40'}`,
            borderRadius: 6,
            padding: '5px 10px',
            background: active ? color : `${color}10`,
            boxShadow: active ? `0 0 12px ${color}` : 'none',
            transition: 'all 0.2s',
          }}>
            [{key}] {label}
          </div>
        ))}
      </motion.div>

      {/* Freeze overlay */}
      {frozen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(100, 180, 255, 0.08)',
            pointerEvents: 'none',
            zIndex: 400,
            border: '3px solid rgba(136, 204, 255, 0.4)',
          }}
        />
      )}

      {/* Boss hp bar */}
      {isBoss && (
        <div style={{
          position: 'fixed',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          width: 320,
        }}>
          <div style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: 11,
            color: '#ff0080',
            letterSpacing: '0.2em',
            textAlign: 'center',
            marginBottom: 6,
            textShadow: '0 0 10px #ff0080',
          }}>
            ◈ THE ADMINISTRATOR ◈
          </div>
          <div style={{ height: 10, background: 'rgba(255,0,128,0.15)', borderRadius: 5, border: '1px solid #ff008060' }}>
            <motion.div
              animate={{ width: `${(bossHp / 5) * 100}%` }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #ff0080, #ff55aa)', borderRadius: 5, boxShadow: '0 0 10px #ff0080' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
