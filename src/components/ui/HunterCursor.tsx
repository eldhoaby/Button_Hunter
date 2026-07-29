// ═══════════════════════════════════════════════════════════════
// BUTTON HUNTER — Hunter Drone Cursor
// Replaces the browser cursor entirely
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { MousePosition } from '../../types';

interface HunterCursorProps {
  mouse: MousePosition;
  onDash?: () => void;
  onFreeze?: () => void;
  onEMP?: () => void;
  isFreezeActive?: boolean;
  isRadarActive?: boolean;
  empCooldown?: number;   // 0-1, 1=ready
  dashCooldown?: number;  // 0-1, 1=ready
  scanning?: boolean;
}

export const HunterCursor: React.FC<HunterCursorProps> = ({
  mouse,
  isFreezeActive = false,
  isRadarActive = false,
  empCooldown = 1,
  dashCooldown = 1,
  scanning = true,
}) => {
  const [trail, setTrail] = useState<{ x: number; y: number; id: number; age: number }[]>([]);
  const trailRef = useRef<{ x: number; y: number; id: number; age: number }[]>([]);
  const idCounter = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Add trail point on mouse move
    const pt = { x: mouse.x, y: mouse.y, id: idCounter.current++, age: 1 };
    trailRef.current = [pt, ...trailRef.current].slice(0, 18);
  }, [mouse.x, mouse.y]);

  useEffect(() => {
    const tick = () => {
      trailRef.current = trailRef.current
        .map(p => ({ ...p, age: p.age - 0.07 }))
        .filter(p => p.age > 0);
      setTrail([...trailRef.current]);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const ringColor = isFreezeActive ? '#88ccff' : '#00f5ff';
  const coreColor = isRadarActive ? '#00ff88' : '#00f5ff';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {/* Neon trail */}
      {trail.map((pt) => (
        <div
          key={pt.id}
          style={{
            position: 'absolute',
            left: pt.x - 2,
            top:  pt.y - 2,
            width:   4,
            height:  4,
            borderRadius: '50%',
            background: coreColor,
            opacity: pt.age * 0.6,
            transform: `scale(${pt.age})`,
            boxShadow: `0 0 6px ${coreColor}`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Radar sweep ring (when radar active) */}
      {isRadarActive && (
        <div
          style={{
            position: 'absolute',
            left: mouse.x - 80,
            top:  mouse.y - 80,
            width:  160,
            height: 160,
            border: `2px solid rgba(0, 255, 136, 0.3)`,
            borderRadius: '50%',
            animation: 'spin-slow 2s linear infinite',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: '50%', height: '2px',
              background: 'linear-gradient(90deg, transparent, #00ff88)',
              transformOrigin: 'left center',
              animation: 'radar-sweep 2s linear infinite',
            }}
          />
        </div>
      )}

      {/* Outer scan ring */}
      {scanning && (
        <>
          <motion.div
            style={{
              position: 'absolute',
              left: mouse.x - 20,
              top:  mouse.y - 20,
              width: 40, height: 40,
              border: `1px solid ${ringColor}`,
              borderRadius: '50%',
              opacity: 0.5,
            }}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            style={{
              position: 'absolute',
              left: mouse.x - 20,
              top:  mouse.y - 20,
              width: 40, height: 40,
              border: `1px solid ${ringColor}`,
              borderRadius: '50%',
              opacity: 0.3,
            }}
            animate={{
              scale: [1, 2.5, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
          />
        </>
      )}

      {/* Freeze ring */}
      {isFreezeActive && (
        <motion.div
          style={{
            position: 'absolute',
            left: mouse.x - 120,
            top:  mouse.y - 120,
            width: 240, height: 240,
            border: '2px solid rgba(136, 204, 255, 0.6)',
            borderRadius: '50%',
          }}
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Core drone body */}
      <div
        style={{
          position: 'absolute',
          left: mouse.x - 10,
          top:  mouse.y - 10,
          width: 20, height: 20,
          pointerEvents: 'none',
        }}
      >
        {/* Outer hex ring */}
        <motion.svg
          width="20" height="20" viewBox="0 0 20 20"
          style={{ position: 'absolute', inset: 0 }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          <polygon
            points="10,1 17,5 17,15 10,19 3,15 3,5"
            fill="none"
            stroke={ringColor}
            strokeWidth="1.5"
            opacity="0.8"
          />
        </motion.svg>

        {/* Inner crosshair */}
        <svg width="20" height="20" viewBox="0 0 20 20" style={{ position: 'absolute', inset: 0 }}>
          <line x1="10" y1="4"  x2="10" y2="8"  stroke={coreColor} strokeWidth="1.5" opacity="0.9" />
          <line x1="10" y1="12" x2="10" y2="16" stroke={coreColor} strokeWidth="1.5" opacity="0.9" />
          <line x1="4"  y1="10" x2="8"  y2="10" stroke={coreColor} strokeWidth="1.5" opacity="0.9" />
          <line x1="12" y1="10" x2="16" y2="10" stroke={coreColor} strokeWidth="1.5" opacity="0.9" />
          <circle cx="10" cy="10" r="2" fill={coreColor} />
        </svg>

        {/* Center glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 4, height: 4,
            borderRadius: '50%',
            background: coreColor,
            boxShadow: `0 0 8px ${coreColor}, 0 0 20px ${coreColor}`,
          }}
        />
      </div>

      {/* Ability cooldown indicators */}
      <div
        style={{
          position: 'absolute',
          left: mouse.x + 18,
          top:  mouse.y - 6,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pointerEvents: 'none',
          opacity: 0.7,
        }}
      >
        {/* EMP bar */}
        <div style={{ width: 24, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
          <div style={{
            width: `${empCooldown * 100}%`, height: '100%',
            background: '#ff0080', borderRadius: 2,
            transition: 'width 0.1s linear',
          }} />
        </div>
        {/* Dash bar */}
        <div style={{ width: 24, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
          <div style={{
            width: `${dashCooldown * 100}%`, height: '100%',
            background: '#00f5ff', borderRadius: 2,
            transition: 'width 0.1s linear',
          }} />
        </div>
      </div>
    </div>
  );
};
