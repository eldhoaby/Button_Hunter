// ═══════════════════════════════════════════════════════════════
// BUTTON HUNTER — Physics & Math Utilities
// ═══════════════════════════════════════════════════════════════

import type { Vector2D } from '../types';

/** Euclidean distance between two points */
export function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

/** Unit vector pointing AWAY from cursor */
export function calculateEscapeVector(
  elementX: number, elementY: number,
  cursorX: number,  cursorY: number
): Vector2D {
  const dx = elementX - cursorX;
  const dy = elementY - cursorY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) {
    const angle = Math.random() * Math.PI * 2;
    return { x: Math.cos(angle), y: Math.sin(angle) };
  }
  return { x: dx / dist, y: dy / dist };
}

/** Unit vector pointing TOWARD target */
export function calculateApproachVector(
  fromX: number, fromY: number,
  toX:   number, toY:   number
): Vector2D {
  const v = calculateEscapeVector(fromX, fromY, toX, toY);
  return { x: -v.x, y: -v.y };
}

/** Clamp position inside viewport with optional padding */
export function clampToViewport(
  x: number, y: number,
  elementW: number, elementH: number,
  padding = 20
): Vector2D {
  const maxX = window.innerWidth  - elementW - padding;
  const maxY = window.innerHeight - elementH - padding;
  return {
    x: Math.max(padding, Math.min(x, maxX)),
    y: Math.max(padding, Math.min(y, maxY)),
  };
}

/** Random position within viewport */
export function randomViewportPosition(
  elementW: number, elementH: number,
  padding = 40
): Vector2D {
  return {
    x: padding + Math.random() * (window.innerWidth  - elementW - padding * 2),
    y: padding + Math.random() * (window.innerHeight - elementH - padding * 2),
  };
}

/** Rotate a vector by an angle (radians) */
export function deflectVector(vec: Vector2D, angle: number): Vector2D {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: vec.x * cos - vec.y * sin, y: vec.x * sin + vec.y * cos };
}

/** Spring-lerp: smooth easing toward target */
export function springLerp(current: number, target: number, stiffness: number): number {
  return current + (target - current) * stiffness;
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/** Normalize a vector */
export function normalize(v: Vector2D): Vector2D {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

/** Add two vectors */
export function addVectors(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

/** Scale a vector */
export function scaleVector(v: Vector2D, s: number): Vector2D {
  return { x: v.x * s, y: v.y * s };
}

/** Limit vector magnitude */
export function limitVector(v: Vector2D, max: number): Vector2D {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len > max) return scaleVector(normalize(v), max);
  return v;
}

/** Gravity pull toward a point */
export function gravityVector(
  fromX: number, fromY: number,
  toX:   number, toY:   number,
  strength: number
): Vector2D {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
  const force = strength / (dist * dist);
  return { x: dx * force, y: dy * force };
}

/** Random float in [min, max] */
export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Random int in [min, max] inclusive */
export function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

/** Score calculation */
export function calculateScore(
  timeTaken: number,
  failedClicks: number,
  level: number,
  combo: number
): number {
  const base        = 10000;
  const timePenalty = timeTaken * 3;
  const missPenalty = failedClicks * 20;
  const levelBonus  = level * 2000;
  const comboBonus  = combo * 150;
  return Math.max(0, base - timePenalty - missPenalty + levelBonus + comboBonus);
}

/** Check if a position is near the edge of the viewport */
export function isNearEdge(
  x: number, y: number,
  w: number, h: number,
  threshold = 60
): boolean {
  return (
    x < threshold ||
    y < threshold ||
    x + w > window.innerWidth  - threshold ||
    y + h > window.innerHeight - threshold
  );
}

/** Wrap position to opposite side of viewport */
export function wrapPosition(
  x: number, y: number,
  w: number, h: number
): Vector2D {
  let nx = x, ny = y;
  if (x + w < -20) nx = window.innerWidth  + 10;
  if (x > window.innerWidth  + 20) nx = -w - 10;
  if (y + h < -20) ny = window.innerHeight + 10;
  if (y > window.innerHeight + 20) ny = -h - 10;
  return { x: nx, y: ny };
}
