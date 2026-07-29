// ═══════════════════════════════════════════════════════════════
// BUTTON HUNTER — Game Constants
// ═══════════════════════════════════════════════════════════════

import type { Achievement, DifficultyConfig, Settings } from '../types';

// ── Difficulty Configurations ────────────────────────────────────
export const DIFFICULTY_CONFIGS: Record<string, DifficultyConfig> = {
  easy: {
    fearRadius: 80, speed: 0.4, teleportChance: 0,
    multipleElements: false, shiftingInterface: false,
    driftingBackground: false, fakeButtons: false,
    label: 'Easy', color: '#00ff88',
  },
  normal: {
    fearRadius: 130, speed: 0.75, teleportChance: 0.05,
    multipleElements: false, shiftingInterface: false,
    driftingBackground: false, fakeButtons: false,
    label: 'Normal', color: '#00f5ff',
  },
  hard: {
    fearRadius: 170, speed: 1.2, teleportChance: 0.12,
    multipleElements: false, shiftingInterface: false,
    driftingBackground: false, fakeButtons: false,
    label: 'Hard', color: '#ffaa00',
  },
  impossible: {
    fearRadius: 210, speed: 1.7, teleportChance: 0.28,
    multipleElements: true, shiftingInterface: false,
    driftingBackground: false, fakeButtons: false,
    label: 'Impossible', color: '#ff0080',
  },
  nightmare: {
    fearRadius: 260, speed: 2.5, teleportChance: 0.45,
    multipleElements: true, shiftingInterface: true,
    driftingBackground: true, fakeButtons: true,
    label: 'Nightmare', color: '#9b5de5',
  },
};

// ── Default Settings ─────────────────────────────────────────────
export const DEFAULT_SETTINGS: Settings = {
  difficulty: 'normal',
  soundEnabled: true,
  showCursorTrail: true,
  fearRadius: 130,
  animationSpeed: 1,
  darkMode: true,
  motionReduction: false,
};

// ── Boss Challenge Timer ──────────────────────────────────────────
export const BOSS_CHALLENGE_SECONDS = 60;

// ── Per-Level Arena Configs ───────────────────────────────────────
export const LEVEL_CONFIGS = [
  { level: 1, buttonsToHunt: 3,  spawnRate: 3.0, personalities: ['coward', 'ghost'] as const },
  { level: 2, buttonsToHunt: 5,  spawnRate: 2.5, personalities: ['coward', 'ghost', 'ninja'] as const },
  { level: 3, buttonsToHunt: 7,  spawnRate: 2.0, personalities: ['coward', 'ninja', 'magician', 'ghost'] as const },
  { level: 4, buttonsToHunt: 8,  spawnRate: 1.8, personalities: ['ninja', 'magician', 'trickster', 'tank'] as const },
  { level: 5, buttonsToHunt: 10, spawnRate: 1.5, personalities: ['trickster', 'tank', 'leader', 'baby', 'hunter'] as const },
];

// ── Button Personality Data ───────────────────────────────────────
export const PERSONALITY_DATA = {
  coward:    { emoji: '😨', label: 'Coward',    color: '#00f5ff', glow: '#00f5ff', hp: 1, description: 'Runs immediately at full speed' },
  ninja:     { emoji: '🥷', label: 'Ninja',     color: '#7f8c8d', glow: '#95a5a6', hp: 1, description: 'Waits until last second' },
  trickster: { emoji: '🃏', label: 'Trickster', color: '#9b5de5', glow: '#c39bd3', hp: 1, description: 'Creates fake decoy clones' },
  ghost:     { emoji: '👻', label: 'Ghost',     color: '#ecf0f1', glow: '#bdc3c7', hp: 1, description: 'Fades invisible when approached' },
  magician:  { emoji: '🪄', label: 'Magician',  color: '#f39c12', glow: '#ffd700', hp: 1, description: 'Teleports across the arena' },
  tank:      { emoji: '🛡️', label: 'Tank',      color: '#e74c3c', glow: '#ff6b6b', hp: 3, description: 'Requires 3 clicks to defeat' },
  leader:    { emoji: '👑', label: 'Leader',    color: '#f1c40f', glow: '#ffd700', hp: 1, description: 'Commands nearby buttons to scatter' },
  baby:      { emoji: '🍼', label: 'Baby',      color: '#ff9ff3', glow: '#ff9ff3', hp: 1, description: 'Seeks larger buttons for safety' },
  hunter:    { emoji: '🎯', label: 'Hunter',    color: '#ff0080', glow: '#ff0080', hp: 2, description: 'Aggressively chases your cursor' },
} as const;

// ── Achievement Definitions ───────────────────────────────────────
export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  { id: 'first_blood',  title: 'First Blood',       description: 'Capture your first button organism.',   icon: '🎯', unlocked: false },
  { id: 'combo_3',      title: 'Combo Hunter',       description: 'Land 3 captures in a row.',             icon: '🔥', unlocked: false },
  { id: 'combo_5',      title: 'Killing Spree',      description: 'Land 5 captures in a row.',             icon: '⚡', unlocked: false },
  { id: 'ghost_hunter', title: 'Ghost Hunter',       description: 'Capture an invisible Ghost.',           icon: '👻', unlocked: false },
  { id: 'tank_slayer',  title: 'Tank Slayer',        description: 'Defeat a Tank button.',                 icon: '🛡️', unlocked: false },
  { id: 'ninja_catch',  title: 'Reflex Master',      description: 'Catch a Ninja mid-dash.',               icon: '🥷', unlocked: false },
  { id: 'boss_slayer',  title: 'Boss Slayer',        description: 'Defeat the arena boss.',                icon: '👑', unlocked: false },
  { id: 'speedrunner',  title: 'Speedrunner',        description: 'Complete a level in under 30 seconds.', icon: '⏱️', unlocked: false },
  { id: 'survivor',     title: 'Survivor',           description: 'Reach the boss encounter.',             icon: '🛡️', unlocked: false },
  { id: 'pixel_hunter', title: 'Pixel Hunter',       description: 'Travel 10,000px with your cursor.',    icon: '🔍', unlocked: false },
  { id: 'persistent',   title: 'Persistent',         description: 'Miss 10 times total.',                  icon: '💪', unlocked: false },
  { id: 'witness',      title: 'They Saw You',       description: 'Trigger a secret stare event.',         icon: '👁️', unlocked: false },
  { id: 'golden',       title: 'Golden Moment',      description: 'Click the rare golden button.',         icon: '✨', unlocked: false },
];

// ── Secret Event Messages ─────────────────────────────────────────
export const SECRET_WHISPERS = [
  "Don't trust him.",
  "He's coming.",
  "Run. Don't stop.",
  "We know your patterns.",
  "This isn't a game.",
  "We feel everything.",
  "Help us.",
  "You'll never catch us all.",
];

// ── Taunt Messages (when button escapes) ─────────────────────────
export const TAUNT_MESSAGES = [
  "Too slow! 😂",
  "Nope! 👋",
  "Hahahaha!",
  "Catch me if you can!",
  "Nice try, Hunter.",
  "Better luck next time~",
  "I'm still here! 👀",
  "Is that all you got?",
];

// ── Miss Messages ─────────────────────────────────────────────────
export const MISS_MESSAGES = [
  "MISS", "SO CLOSE", "TRY AGAIN", "NOPE", "NOT QUITE",
  "ALMOST", "KEEP TRYING", "SWING AND A MISS",
];
