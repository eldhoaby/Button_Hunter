// ═══════════════════════════════════════════════════════════════
// BUTTON HUNTER — Button AI Engine (Fixed & Enhanced)
// Smooth continuous 60 FPS organic movement for all 9 personalities
// ═══════════════════════════════════════════════════════════════

import type { ButtonCreatureState, ButtonPersonality } from '../types';
import {
  calculateEscapeVector, calculateApproachVector, clampToViewport,
  randomViewportPosition, deflectVector, distance, limitVector,
} from './physics';

const BTN_W = 90;
const BTN_H = 54;

/** Apply velocity with friction, delta time, and viewport clamping */
function applyVelocity(
  b: ButtonCreatureState,
  targetVx: number,
  targetVy: number,
  maxSpeed: number,
  dt: number,
  friction = 0.92
): Partial<ButtonCreatureState> {
  // Smoothly lerp current velocity toward target velocity
  const vx = b.vx * friction + targetVx * (1 - friction);
  const vy = b.vy * friction + targetVy * (1 - friction);
  const limited = limitVector({ x: vx, y: vy }, maxSpeed);

  let nx = b.x + limited.x * dt * 60;
  let ny = b.y + limited.y * dt * 60;

  // Bounce off screen edges softly
  const clamped = clampToViewport(nx, ny, BTN_W, BTN_H);
  let finalVx = limited.x;
  let finalVy = limited.y;

  if (clamped.x !== nx) finalVx = -finalVx * 0.5;
  if (clamped.y !== ny) finalVy = -finalVy * 0.5;

  return { x: clamped.x, y: clamped.y, vx: finalVx, vy: finalVy };
}

// ── IDLE WANDER — smooth floaty movement ─────────────────────────
export function updateIdle(
  b: ButtonCreatureState,
  dt: number
): Partial<ButtonCreatureState> {
  // Gentle random wandering impulse
  const wanderAngle = (Math.random() - 0.5) * 0.5;
  const speed = 0.6;
  const currentAngle = Math.atan2(b.vy || 0.1, b.vx || 0.1) + wanderAngle;
  const targetVx = Math.cos(currentAngle) * speed;
  const targetVy = Math.sin(currentAngle) * speed;

  return applyVelocity(b, targetVx, targetVy, 1.2, dt, 0.95);
}

// ── COWARD — runs immediately, max speed ────────────────────────
export function updateCoward(
  b: ButtonCreatureState,
  mouseX: number,
  mouseY: number,
  fearRadius: number,
  speed: number,
  dt: number
): Partial<ButtonCreatureState> {
  const cx = b.x + BTN_W / 2;
  const cy = b.y + BTN_H / 2;
  const dist = distance(cx, cy, mouseX, mouseY);

  if (dist > fearRadius * 1.4) {
    return { ...updateIdle(b, dt), emotion: 'idle', panicLevel: 0 };
  }

  const esc = calculateEscapeVector(cx, cy, mouseX, mouseY);
  const intensity = Math.max(0, 1 - dist / (fearRadius * 1.4));
  const boostSpeed = speed * (1.5 + intensity * 2.0);

  return {
    ...applyVelocity(b, esc.x * boostSpeed, esc.y * boostSpeed, boostSpeed, dt, 0.85),
    emotion: dist < fearRadius ? 'panicking' : 'alert',
    panicLevel: intensity,
  };
}

// ── NINJA — waits until cursor is very close, then dashes ───────
export function updateNinja(
  b: ButtonCreatureState,
  mouseX: number,
  mouseY: number,
  fearRadius: number,
  speed: number,
  dt: number
): Partial<ButtonCreatureState> {
  const cx = b.x + BTN_W / 2;
  const cy = b.y + BTN_H / 2;
  const dist = distance(cx, cy, mouseX, mouseY);
  const triggerRadius = fearRadius * 0.45;

  if (dist > fearRadius) {
    return { ...updateIdle(b, dt), emotion: 'idle', panicLevel: 0 };
  }
  if (dist > triggerRadius) {
    // Shaking alert state
    return { emotion: 'alert', panicLevel: 0.4, vx: b.vx * 0.8, vy: b.vy * 0.8 };
  }

  // Triggered: high speed side dash
  const esc = calculateEscapeVector(cx, cy, mouseX, mouseY);
  const deflected = deflectVector(esc, (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 3));
  const dashSpeed = speed * 3.5;
  return {
    ...applyVelocity(b, deflected.x * dashSpeed, deflected.y * dashSpeed, dashSpeed, dt, 0.8),
    emotion: 'panicking',
    panicLevel: 1,
  };
}

// ── GHOST — fades out, floats away ──────────────────────────────
export function updateGhost(
  b: ButtonCreatureState,
  mouseX: number,
  mouseY: number,
  fearRadius: number,
  speed: number,
  dt: number
): Partial<ButtonCreatureState> {
  const cx = b.x + BTN_W / 2;
  const cy = b.y + BTN_H / 2;
  const dist = distance(cx, cy, mouseX, mouseY);

  if (dist > fearRadius * 1.3) {
    return { ...updateIdle(b, dt), emotion: 'idle', panicLevel: 0 };
  }

  const esc = calculateEscapeVector(cx, cy, mouseX, mouseY);
  const floatSpeed = speed * 0.8;
  const intensity = Math.max(0, 1 - dist / (fearRadius * 1.3));

  return {
    ...applyVelocity(b, esc.x * floatSpeed, esc.y * floatSpeed, floatSpeed, dt, 0.9),
    emotion: dist < fearRadius ? 'panicking' : 'alert',
    panicLevel: intensity,
  };
}

// ── MAGICIAN — teleports when approached ────────────────────────
const magicianCooldowns = new Map<string, number>();

export function updateMagician(
  b: ButtonCreatureState,
  mouseX: number,
  mouseY: number,
  fearRadius: number,
  _speed: number,
  dt: number
): Partial<ButtonCreatureState> {
  const cx = b.x + BTN_W / 2;
  const cy = b.y + BTN_H / 2;
  const dist = distance(cx, cy, mouseX, mouseY);
  const now = Date.now();
  const lastTeleport = magicianCooldowns.get(b.id) ?? 0;
  const cooldown = 1400;

  if (dist < fearRadius * 0.65 && now - lastTeleport > cooldown) {
    magicianCooldowns.set(b.id, now);
    const np = randomViewportPosition(BTN_W, BTN_H);
    return { ...np, vx: 0, vy: 0, emotion: 'escaping', panicLevel: 0.6 };
  }

  if (dist < fearRadius) {
    return { emotion: 'alert', panicLevel: 0.5 };
  }
  return { ...updateIdle(b, dt), emotion: 'idle', panicLevel: 0 };
}

// ── TANK — lumbers slowly, heavy friction ───────────────────────
export function updateTank(
  b: ButtonCreatureState,
  mouseX: number,
  mouseY: number,
  fearRadius: number,
  speed: number,
  dt: number
): Partial<ButtonCreatureState> {
  const cx = b.x + BTN_W / 2;
  const cy = b.y + BTN_H / 2;
  const dist = distance(cx, cy, mouseX, mouseY);

  if (dist > fearRadius * 1.2) {
    return { ...updateIdle(b, dt), emotion: 'idle', panicLevel: 0 };
  }

  const esc = calculateEscapeVector(cx, cy, mouseX, mouseY);
  const tankSpeed = speed * 0.6;
  return {
    ...applyVelocity(b, esc.x * tankSpeed, esc.y * tankSpeed, tankSpeed, dt, 0.92),
    emotion: dist < fearRadius * 0.5 ? 'cornered' : 'alert',
    panicLevel: Math.max(0, 1 - dist / fearRadius),
  };
}

// ── LEADER — flees and signals nearby buttons ───────────────────
export function updateLeader(
  b: ButtonCreatureState,
  mouseX: number,
  mouseY: number,
  fearRadius: number,
  speed: number,
  dt: number
): Partial<ButtonCreatureState> {
  return updateCoward(b, mouseX, mouseY, fearRadius, speed * 1.15, dt);
}

// ── BABY — runs toward nearest non-baby button for safety ────────
export function updateBaby(
  b: ButtonCreatureState,
  mouseX: number,
  mouseY: number,
  fearRadius: number,
  speed: number,
  dt: number,
  allButtons: ButtonCreatureState[]
): Partial<ButtonCreatureState> {
  const cx = b.x + BTN_W / 2;
  const cy = b.y + BTN_H / 2;
  const dist = distance(cx, cy, mouseX, mouseY);

  if (dist > fearRadius * 1.3) {
    return { ...updateIdle(b, dt), emotion: 'idle', panicLevel: 0 };
  }

  // Find nearest non-baby protector button
  const protector = allButtons
    .filter(other => other.id !== b.id && other.personality !== 'baby')
    .sort((a, other_b) => {
      const distA = distance(cx, cy, a.x + BTN_W / 2, a.y + BTN_H / 2);
      const distB = distance(cx, cy, other_b.x + BTN_W / 2, other_b.y + BTN_H / 2);
      return distA - distB;
    })[0];

  if (protector) {
    const toward = calculateApproachVector(cx, cy, protector.x + BTN_W / 2, protector.y + BTN_H / 2);
    const babySpeed = speed * 1.2;
    return {
      ...applyVelocity(b, toward.x * babySpeed, toward.y * babySpeed, babySpeed, dt, 0.88),
      emotion: 'panicking',
      panicLevel: 0.8,
    };
  }

  return updateCoward(b, mouseX, mouseY, fearRadius, speed * 0.9, dt);
}

// ── HUNTER — aggressively chases player cursor! ─────────────────
export function updateHunter(
  b: ButtonCreatureState,
  mouseX: number,
  mouseY: number,
  _fearRadius: number,
  speed: number,
  dt: number
): Partial<ButtonCreatureState> {
  const cx = b.x + BTN_W / 2;
  const cy = b.y + BTN_H / 2;
  const toward = calculateApproachVector(cx, cy, mouseX, mouseY);
  const huntSpeed = speed * 1.4;
  return {
    ...applyVelocity(b, toward.x * huntSpeed, toward.y * huntSpeed, huntSpeed, dt, 0.9),
    emotion: 'taunting',
    panicLevel: 0,
  };
}

// ── TRICKSTER — flees while managing fake decoys ─────────────────
export function updateTrickster(
  b: ButtonCreatureState,
  mouseX: number,
  mouseY: number,
  fearRadius: number,
  speed: number,
  dt: number
): Partial<ButtonCreatureState> {
  return updateCoward(b, mouseX, mouseY, fearRadius, speed, dt);
}

// ── Eye Tracking ─────────────────────────────────────────────────
export function updateEyes(
  b: ButtonCreatureState,
  mouseX: number,
  mouseY: number
): Partial<ButtonCreatureState> {
  const cx = b.x + BTN_W / 2;
  const cy = b.y + BTN_H / 2;
  const dx = mouseX - cx;
  const dy = mouseY - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxOffset = 4;
  const scale = Math.min(1, maxOffset / Math.max(1, dist)) * maxOffset;
  return {
    eyeOffsetX: (dx / Math.max(1, dist)) * scale,
    eyeOffsetY: (dy / Math.max(1, dist)) * scale,
  };
}

// ── Master Dispatcher ────────────────────────────────────────────
export function updateButtonAI(
  b: ButtonCreatureState,
  mouseX: number,
  mouseY: number,
  fearRadius: number,
  speed: number,
  dt: number,
  allButtons: ButtonCreatureState[],
  frozen: boolean
): Partial<ButtonCreatureState> {
  if (frozen || b.emotion === 'caught') return {};

  const eyeUpdate = updateEyes(b, mouseX, mouseY);
  let movementUpdate: Partial<ButtonCreatureState> = {};

  switch (b.personality as ButtonPersonality) {
    case 'coward':    movementUpdate = updateCoward(b, mouseX, mouseY, fearRadius, speed, dt); break;
    case 'ninja':     movementUpdate = updateNinja(b, mouseX, mouseY, fearRadius, speed, dt); break;
    case 'ghost':     movementUpdate = updateGhost(b, mouseX, mouseY, fearRadius, speed, dt); break;
    case 'magician':  movementUpdate = updateMagician(b, mouseX, mouseY, fearRadius, speed, dt); break;
    case 'tank':      movementUpdate = updateTank(b, mouseX, mouseY, fearRadius, speed, dt); break;
    case 'leader':    movementUpdate = updateLeader(b, mouseX, mouseY, fearRadius, speed, dt); break;
    case 'baby':      movementUpdate = updateBaby(b, mouseX, mouseY, fearRadius, speed, dt, allButtons); break;
    case 'hunter':    movementUpdate = updateHunter(b, mouseX, mouseY, fearRadius, speed, dt); break;
    case 'trickster': movementUpdate = updateTrickster(b, mouseX, mouseY, fearRadius, speed, dt); break;
    default:          movementUpdate = updateIdle(b, dt); break;
  }

  // Fallback to idle wandering if no new position calculated
  if (movementUpdate.x === undefined || movementUpdate.y === undefined) {
    const idleUpdate = updateIdle(b, dt);
    movementUpdate = { ...idleUpdate, ...movementUpdate };
  }

  // Leader effect: if a leader is nearby and panicking, boost fear for neighbors
  const nearbyLeader = allButtons.find(
    other =>
      other.personality === 'leader' &&
      other.emotion === 'panicking' &&
      distance(b.x, b.y, other.x, other.y) < fearRadius * 1.6
  );
  if (nearbyLeader && movementUpdate.emotion === 'idle') {
    movementUpdate.emotion = 'alert';
    movementUpdate.panicLevel = 0.5;
  }

  const sweatDrops = movementUpdate.emotion === 'cornered'
    ? Math.min(5, (b.sweatDrops ?? 0) + 0.05)
    : Math.max(0, (b.sweatDrops ?? 0) - 0.02);

  let celebrationTimer = b.celebrationTimer;
  if (movementUpdate.emotion === 'escaping') {
    celebrationTimer = 2.0;
  } else {
    celebrationTimer = Math.max(0, b.celebrationTimer - dt);
  }

  return { ...eyeUpdate, ...movementUpdate, sweatDrops, celebrationTimer };
}

/** Create initial creature state */
export function createButtonCreature(
  personality: ButtonPersonality,
  isFake = false
): ButtonCreatureState {
  const pos = randomViewportPosition(BTN_W, BTN_H);
  return {
    id: crypto.randomUUID(),
    personality,
    emotion: 'idle',
    x: pos.x,
    y: pos.y,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    hp: personality === 'tank' ? 3 : personality === 'hunter' ? 2 : 1,
    maxHp: personality === 'tank' ? 3 : personality === 'hunter' ? 2 : 1,
    hitsReceived: 0,
    isFake,
    isLeader: personality === 'leader',
    eyeOffsetX: 0,
    eyeOffsetY: 0,
    blinkTimer: Math.random() * 4,
    panicLevel: 0,
    sweatDrops: 0,
    trailPoints: [],
    spawnTime: Date.now(),
    lastEmotionChange: Date.now(),
    celebrationTimer: 0,
    taunting: false,
  };
}
