// ═══════════════════════════════════════════════════════════════
// BUTTON HUNTER — Button Creature Component
// Living digital organisms with eyes, emotions, trails, and death
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ButtonCreatureState } from '../../types';
import { PERSONALITY_DATA } from '../../constants';
import { distance } from '../../utils/physics';
import { playCaptureSound, playExplosionSound, playHeartbeatSound } from '../../utils/sound';

const BTN_W = 90;
const BTN_H = 54;

interface ButtonCreatureProps {
  creature: ButtonCreatureState;
  mouseX: number;
  mouseY: number;
  fearRadius: number;
  frozen: boolean;
  onClick: (id: string, isFake: boolean) => void;
}

// ── Eye Component ─────────────────────────────────────────────────
const Eye: React.FC<{
  pupilX: number;
  pupilY: number;
  panicLevel: number;
  emotion: string;
  size?: number;
}> = ({ pupilX, pupilY, panicLevel, emotion, size = 1 }) => {
  const eyeSize = 10 * size;
  const pupilSize = 4 * size;
  const wideOpen = emotion === 'alert' || emotion === 'panicking' || emotion === 'cornered';
  const eyeH = wideOpen ? eyeSize : eyeSize * 0.6;

  return (
    <div style={{
      position: 'relative',
      width: eyeSize,
      height: eyeH,
      background: '#fff',
      borderRadius: eyeH / 2,
      overflow: 'hidden',
      boxShadow: wideOpen ? '0 0 4px rgba(255,255,255,0.8)' : 'none',
      transition: 'height 0.2s ease',
      marginTop: wideOpen ? 0 : (eyeSize * 0.2),
      border: '1px solid rgba(0,0,0,0.3)',
    }}>
      {/* Pupil */}
      <div style={{
        position: 'absolute',
        width: pupilSize,
        height: pupilSize,
        borderRadius: '50%',
        background: panicLevel > 0.5 ? '#ff0000' : '#1a1a2e',
        top: '50%',
        left: '50%',
        transform: `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`,
        transition: 'transform 0.1s ease',
        boxShadow: panicLevel > 0.7 ? '0 0 3px #ff0000' : 'none',
      }} />
      {/* Shine */}
      <div style={{
        position: 'absolute',
        width: 2, height: 2,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.9)',
        top: 2, left: 3,
        pointerEvents: 'none',
      }} />
    </div>
  );
};

// ── Sweat Drop ────────────────────────────────────────────────────
const SweatDrop: React.FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 0, scaleY: 0.5 }}
    animate={{ opacity: [0, 1, 1, 0], y: 16, scaleY: [0.5, 1, 1.3] }}
    transition={{ duration: 0.9, delay, repeat: Infinity, repeatDelay: 1.2 }}
    style={{
      position: 'absolute',
      left: x, top: y,
      width: 5, height: 7,
      borderRadius: '50% 50% 60% 60% / 60% 60% 40% 40%',
      background: 'linear-gradient(180deg, #88ccff, #4499dd)',
      boxShadow: '0 0 3px rgba(100, 200, 255, 0.6)',
      pointerEvents: 'none',
    }}
  />
);

// ── Explosion Particles ───────────────────────────────────────────
const ExplosionParticles: React.FC<{ color: string; glow: string }> = ({ color, glow }) => {
  const particleCount = 16;
  return (
    <>
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const dist  = 40 + Math.random() * 60;
        const tx    = Math.cos(angle) * dist;
        const ty    = Math.sin(angle) * dist;
        const size  = 3 + Math.random() * 5;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: tx, y: ty, scale: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: Math.random() * 0.1 }}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: size, height: size,
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 6px ${glow}, 0 0 12px ${glow}`,
              marginTop: -size / 2,
              marginLeft: -size / 2,
              pointerEvents: 'none',
            }}
          />
        );
      })}
      {/* Central flash */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glow}, transparent)`,
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

// ── Main Button Creature ──────────────────────────────────────────
export const ButtonCreature: React.FC<ButtonCreatureProps> = ({
  creature,
  mouseX,
  mouseY,
  fearRadius,
  frozen,
  onClick,
}) => {
  const pData = PERSONALITY_DATA[creature.personality];
  const [exploding, setExploding] = useState(false);
  const [showTaunt, setShowTaunt] = useState(false);
  const tauntTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cx = creature.x + BTN_W / 2;
  const cy = creature.y + BTN_H / 2;
  const dist = distance(cx, cy, mouseX, mouseY);
  const isNearCursor = dist < fearRadius * 0.8;
  const isCornered = creature.emotion === 'cornered';
  const isCelebrating = creature.celebrationTimer > 0;

  // Ghost opacity
  const ghostOpacity = creature.personality === 'ghost'
    ? Math.max(0.08, Math.min(1, dist / fearRadius))
    : 1;

  // Heartbeat sound for cornered
  useEffect(() => {
    if (isCornered) {
      heartbeatRef.current = setInterval(() => { playHeartbeatSound(); }, 700);
    }
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [isCornered]);

  // Taunt flash
  useEffect(() => {
    if (creature.emotion === 'escaping' || creature.celebrationTimer > 0) {
      setShowTaunt(true);
      if (tauntTimeoutRef.current) clearTimeout(tauntTimeoutRef.current);
      tauntTimeoutRef.current = setTimeout(() => setShowTaunt(false), 1800);
    }
  }, [creature.celebrationTimer, creature.emotion]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (frozen) return;
    if (exploding) return;

    const newHp = creature.hp - 1;
    if (newHp <= 0) {
      setExploding(true);
      playExplosionSound();
      setTimeout(() => onClick(creature.id, creature.isFake), 500);
    } else {
      playCaptureSound();
      onClick(creature.id, creature.isFake); // partial hit — handled by parent
    }
  }, [creature, frozen, exploding, onClick]);

  // Body animation based on emotion
  const bodyAnimation = (() => {
    if (exploding) return { scale: [1, 1.5, 0], opacity: [1, 1, 0] };
    if (frozen) return { scale: 1 };
    if (isCornered) return { scale: [1, 1.06, 0.97, 1], x: [0, -3, 3, -2, 2, 0] };
    if (creature.emotion === 'panicking') return { scale: [1, 0.97, 1.02, 1], x: [0, -2, 2, -1, 1, 0] };
    if (isCelebrating) return { y: [0, -6, 0, -4, 0], scale: [1, 1.05, 1] };
    return { scale: [1, 1.02, 1] }; // breathe
  })();

  const bodyTransition = (() => {
    if (exploding) return { duration: 0.5 };
    if (isCornered) return { duration: 0.4, repeat: Infinity, ease: 'easeInOut' };
    if (creature.emotion === 'panicking') return { duration: 0.25, repeat: Infinity, ease: 'linear' };
    if (isCelebrating) return { duration: 0.5, repeat: 3, ease: 'easeInOut' };
    return { duration: 2.5, repeat: Infinity, ease: 'easeInOut' };
  })();

  // HP bar for tank
  const showHpBar = creature.maxHp > 1;

  // Color adjustments
  const currentColor = frozen ? '#88ccff'
    : creature.emotion === 'cornered' ? '#ff6b6b'
    : creature.emotion === 'panicking' ? pData.glow
    : pData.color;

  const glowIntensity = frozen ? 0.3
    : creature.panicLevel * 0.8 + 0.2;

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: creature.x,
        top: creature.y,
        width: BTN_W,
        height: BTN_H,
        zIndex: 100,
        opacity: ghostOpacity,
        cursor: 'none',
      }}
      animate={{
        x: 0,
        y: frozen ? 0 : undefined,
      }}
    >
      {/* Trail points */}
      {creature.trailPoints.slice(0, 8).map((pt, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            left: pt.x - 3,
            top:  pt.y - 3,
            width: 6, height: 6,
            borderRadius: '50%',
            background: pData.glow,
            opacity: (1 - pt.age / 1.5) * 0.4,
            boxShadow: `0 0 4px ${pData.glow}`,
            pointerEvents: 'none',
            zIndex: 99,
          }}
        />
      ))}

      {/* Exploding particles */}
      <AnimatePresence>
        {exploding && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 200 }}>
            <ExplosionParticles color={pData.color} glow={pData.glow} />
          </div>
        )}
      </AnimatePresence>

      {/* Sweat drops when cornered */}
      {isCornered && creature.sweatDrops > 1 && (
        <>
          <SweatDrop x={10} y={-8} delay={0} />
          <SweatDrop x={BTN_W - 16} y={-8} delay={0.4} />
          <SweatDrop x={BTN_W / 2 - 3} y={-10} delay={0.2} />
        </>
      )}

      {/* Trickster: fake badge */}
      {creature.isFake && (
        <div style={{
          position: 'absolute',
          top: -14, left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 9,
          color: '#9b5de5',
          fontFamily: 'Orbitron, monospace',
          letterSpacing: '0.05em',
          opacity: 0.7,
        }}>
          DECOY
        </div>
      )}

      {/* Taunt bubble */}
      <AnimatePresence>
        {showTaunt && creature.emotion !== 'caught' && !exploding && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.7 }}
            style={{
              position: 'absolute',
              top: -12, left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,20,40,0.85)',
              border: `1px solid ${pData.color}`,
              borderRadius: 6,
              padding: '2px 8px',
              fontSize: 10,
              color: pData.color,
              fontFamily: 'Orbitron, monospace',
              whiteSpace: 'nowrap',
              zIndex: 150,
              boxShadow: `0 0 8px ${pData.glow}40`,
            }}
          >
            {isCelebrating ? '✓ GOT AWAY!' : 'HA!'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main body */}
      <motion.div
        onClick={handleClick}
        animate={bodyAnimation}
        transition={bodyTransition as any}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 14,
          background: `linear-gradient(135deg, ${pData.color}22, ${pData.color}11)`,
          border: `1.5px solid ${currentColor}`,
          boxShadow: `
            0 0 ${10 + creature.panicLevel * 20}px ${pData.glow}${Math.round(glowIntensity * 80).toString(16).padStart(2, '0')},
            inset 0 1px 0 rgba(255,255,255,0.08)
          `,
          backdropFilter: 'blur(8px)',
          overflow: 'hidden',
          cursor: 'none',
          userSelect: 'none',
        }}
      >
        {/* Inner glow gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 30% 30%, ${pData.color}18 0%, transparent 70%)`,
          borderRadius: 12,
        }} />

        {/* Scan line shimmer */}
        <motion.div
          style={{
            position: 'absolute',
            left: '-100%', top: 0,
            width: '60%', height: '100%',
            background: `linear-gradient(90deg, transparent, ${pData.color}12, transparent)`,
            borderRadius: 12,
          }}
          animate={{ left: ['−100%', '200%'] }}
          transition={{ duration: 2 + Math.random(), repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
        />

        {/* HP bar for tank/hunter */}
        {showHpBar && (
          <div style={{
            position: 'absolute',
            top: 4, left: 8, right: 8,
            height: 3,
            background: 'rgba(0,0,0,0.5)',
            borderRadius: 2,
          }}>
            <motion.div
              animate={{ width: `${(creature.hp / creature.maxHp) * 100}%` }}
              transition={{ duration: 0.3 }}
              style={{
                height: '100%',
                background: creature.hp > creature.maxHp * 0.5 ? '#00ff88' : '#ff0080',
                borderRadius: 2,
                boxShadow: '0 0 4px currentColor',
              }}
            />
          </div>
        )}

        {/* Face area */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          paddingTop: showHpBar ? 6 : 0,
        }}>
          {/* Eyes row */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Eye
              pupilX={creature.eyeOffsetX}
              pupilY={creature.eyeOffsetY}
              panicLevel={creature.panicLevel}
              emotion={creature.emotion}
            />
            <Eye
              pupilX={creature.eyeOffsetX}
              pupilY={creature.eyeOffsetY}
              panicLevel={creature.panicLevel}
              emotion={creature.emotion}
            />
          </div>

          {/* Mouth expression */}
          <svg width="24" height="10" viewBox="0 0 24 10">
            {creature.emotion === 'idle' || creature.emotion === 'escaping' ? (
              // Happy smile
              <path d="M4 4 Q12 10 20 4" fill="none" stroke={pData.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
            ) : creature.emotion === 'alert' ? (
              // Neutral O
              <ellipse cx="12" cy="6" rx="4" ry="3" fill="none" stroke={pData.color} strokeWidth="1.5" opacity="0.8" />
            ) : creature.emotion === 'panicking' ? (
              // Screaming O
              <ellipse cx="12" cy="6" rx="5" ry="4" fill={`${pData.color}22`} stroke={pData.color} strokeWidth="1.5" opacity="0.9" />
            ) : creature.emotion === 'cornered' ? (
              // Sad frown
              <path d="M4 8 Q12 2 20 8" fill="none" stroke="#ff6b6b" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
            ) : creature.emotion === 'taunting' ? (
              // Evil grin
              <path d="M3 6 Q12 12 21 6" fill="none" stroke={pData.color} strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            ) : (
              <path d="M4 4 Q12 10 20 4" fill="none" stroke={pData.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
            )}
          </svg>
        </div>

        {/* Personality emoji badge (bottom right) */}
        <div style={{
          position: 'absolute',
          bottom: 3, right: 5,
          fontSize: 10,
          opacity: 0.7,
          lineHeight: 1,
          filter: `drop-shadow(0 0 3px ${pData.glow})`,
        }}>
          {pData.emoji}
        </div>

        {/* Corner decorations */}
        <div className="hud-corner hud-corner-tl" style={{ borderColor: `${pData.color}60` }} />
        <div className="hud-corner hud-corner-tr" style={{ borderColor: `${pData.color}60` }} />
        <div className="hud-corner hud-corner-bl" style={{ borderColor: `${pData.color}60` }} />
        <div className="hud-corner hud-corner-br" style={{ borderColor: `${pData.color}60` }} />

        {/* Frozen crystal overlay */}
        {frozen && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(100, 180, 255, 0.15)',
            borderRadius: 12,
          }}>
            <svg width="100%" height="100%" viewBox="0 0 90 54" opacity="0.3">
              <line x1="45" y1="0"  x2="45" y2="54" stroke="#88ccff" strokeWidth="0.5" />
              <line x1="0"  y1="27" x2="90" y2="27" stroke="#88ccff" strokeWidth="0.5" />
              <line x1="0"  y1="0"  x2="90" y2="54" stroke="#88ccff" strokeWidth="0.5" />
              <line x1="90" y1="0"  x2="0"  y2="54" stroke="#88ccff" strokeWidth="0.5" />
            </svg>
          </div>
        )}
      </motion.div>

      {/* Proximity scan arc */}
      {isNearCursor && !frozen && (
        <motion.div
          style={{
            position: 'absolute',
            left: BTN_W / 2 - 40,
            top: BTN_H / 2 - 40,
            width: 80, height: 80,
            border: `1px solid ${pData.color}`,
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
          animate={{ scale: [0.8, 1.4], opacity: [0.4, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
    </motion.div>
  );
};
