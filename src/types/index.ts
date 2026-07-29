// ═══════════════════════════════════════════════════════════════
// BUTTON HUNTER — Complete Type System
// ═══════════════════════════════════════════════════════════════

// ── Button AI Personalities ──────────────────────────────────────
export type ButtonPersonality =
  | 'coward'    // Runs immediately at max speed
  | 'ninja'     // Waits until last second, then vanishes
  | 'trickster' // Spawns decoy clones
  | 'ghost'     // Turns transparent when near cursor
  | 'magician'  // Teleports to random locations
  | 'tank'      // Requires multiple clicks to defeat
  | 'leader'    // Commands nearby buttons to scatter
  | 'baby'      // Runs toward larger buttons for protection
  | 'hunter';   // Chases the cursor instead of fleeing

// ── Button Emotional States ──────────────────────────────────────
export type ButtonEmotion =
  | 'idle'       // Calm, looks around
  | 'alert'      // Spotted cursor, eyes wide
  | 'panicking'  // Running, sweating
  | 'cornered'   // Trapped, crying
  | 'escaping'   // Successfully fled, celebrating
  | 'taunting'   // Hunter: laughing at player
  | 'caught';    // Dying explosion

// ── Game Phases ──────────────────────────────────────────────────
export type GamePhase =
  | 'intro'     // Cinematic intro / main menu
  | 'arena'     // Active gameplay
  | 'boss'      // Boss encounter
  | 'victory'   // Player won
  | 'gameover'; // Player lost (ran out of time)

// ── Arena Environmental Modifiers ────────────────────────────────
export type ArenaModifier =
  | 'none'
  | 'low_gravity'   // Buttons drift upward
  | 'storm'         // Random force pushes applied
  | 'magnetic'      // Buttons cluster magnetically
  | 'electric'      // Sparks between nearby buttons
  | 'warp'          // Space bends near edges
  | 'mirror';       // Controls inverted for player

// ── Cursor Abilities ─────────────────────────────────────────────
export type CursorAbility = 'dash' | 'freeze' | 'emp' | 'radar';

// ── Difficulty ───────────────────────────────────────────────────
export type Difficulty = 'easy' | 'normal' | 'hard' | 'impossible' | 'nightmare';

// ── Mouse / Vector ────────────────────────────────────────────────
export interface MousePosition {
  x: number;
  y: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

// ── Button Creature State ─────────────────────────────────────────
export interface ButtonCreatureState {
  id: string;
  personality: ButtonPersonality;
  emotion: ButtonEmotion;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;           // Max varies by personality (tank = 3)
  maxHp: number;
  hitsReceived: number;
  isFake: boolean;      // Trickster clones
  isLeader: boolean;
  groupId?: string;     // For leader/baby grouping
  eyeOffsetX: number;   // Where eyes are looking
  eyeOffsetY: number;
  blinkTimer: number;
  panicLevel: number;   // 0–1, drives visual intensity
  sweatDrops: number;   // Visual indicator when cornered
  trailPoints: { x: number; y: number; age: number }[];
  spawnTime: number;
  lastEmotionChange: number;
  celebrationTimer: number;  // After escaping
  taunting: boolean;
}

// ── Particle ──────────────────────────────────────────────────────
export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;       // 0–1, decreasing
  maxLife: number;
  size: number;
  color: string;
  type: 'trail' | 'explosion' | 'ambient' | 'sweat' | 'spark' | 'star';
  glow: boolean;
}

// ── HUD / Score ───────────────────────────────────────────────────
export interface GameStats {
  score: number;
  level: number;
  buttonsHunted: number;
  buttonsEscaped: number;
  timePlayed: number;       // seconds
  failedClicks: number;
  successfulClicks: number;
  accuracy: number;
  multiplier: number;       // Score multiplier for combo
  comboCount: number;
  distanceTraveled: number;
  rageLevel: number;        // Legacy but kept
}

// ── Achievement ───────────────────────────────────────────────────
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

// ── Hunter Drone State ────────────────────────────────────────────
export interface HunterState {
  dashCooldown: number;   // ms remaining
  freezeActive: boolean;
  freezeDuration: number;
  empCooldown: number;
  radarActive: boolean;
  radarDuration: number;
  energy: number;         // 0–100
}

// ── Arena State ───────────────────────────────────────────────────
export interface ArenaState {
  modifier: ArenaModifier;
  modifierIntensity: number;  // 0–1
  modifierTimer: number;      // seconds remaining
  level: number;
  buttonsToHunt: number;      // per level
  buttonsHunted: number;
  spawnRate: number;          // seconds between spawns
  chaos: number;              // 0–1, overall chaos level
}

// ── Secret Event ──────────────────────────────────────────────────
export interface SecretEvent {
  type: 'stare' | 'whisper' | 'glitch' | 'help_each_other' | 'golden_button' | 'sentient_bg';
  message?: string;
  duration: number;
  active: boolean;
}

// ── Settings ─────────────────────────────────────────────────────
export interface Settings {
  difficulty: Difficulty;
  soundEnabled: boolean;
  showCursorTrail: boolean;
  fearRadius: number;
  animationSpeed: number;
  darkMode: boolean;
  motionReduction: boolean;
}

// ── Leaderboard ───────────────────────────────────────────────────
export interface LeaderboardEntry {
  id: string;
  playerName: string;
  timeTaken: number;
  failedClicks: number;
  score: number;
  date: number;
  level: number;
}

// ── Difficulty Config ─────────────────────────────────────────────
export interface DifficultyConfig {
  fearRadius: number;
  speed: number;
  teleportChance: number;
  multipleElements: boolean;
  shiftingInterface: boolean;
  driftingBackground: boolean;
  fakeButtons: boolean;
  label: string;
  color: string;
}
