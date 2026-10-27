// Core shared types for NEO DrawAI

export type InputMode = 'mouse' | 'touch' | 'webcam';

/** Which engine produced the guesses. */
export type AIMode = 'mock' | 'gemini';

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  /** Points are in LOGICAL canvas space (see LOGICAL_WIDTH/HEIGHT in lib/canvas/drawing). */
  points: Point[];
  color: string;
  lineWidth: number;
}

export interface AIGuessResult {
  label: string;
  confidence: number; // 0 - 1
}

export interface AIGuessResponse {
  guesses: AIGuessResult[];
  isMock: boolean;
  /** Set when the guess could not be produced; the UI renders this instead of crashing. */
  error?: string;
}

/** Axis-aligned box in LOGICAL canvas coordinates (see LOGICAL_WIDTH/HEIGHT). */
export interface StrokeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * One AI guess made during a round, paired with a snapshot of the drawing at
 * that moment — the raw material for the Quick, Draw!-style "how did the AI
 * see it" replay shown once the round ends.
 */
export interface GuessHistoryEntry {
  id: number;
  strokeCount: number;
  /** Base64 PNG, no `data:` prefix — see exportDrawing(). */
  snapshot: string;
  guesses: AIGuessResult[];
  isMock: boolean;
  /**
   * Bounding box of whatever strokes were newly added since the previous
   * guess. Neither Gemini nor the mock guesser expose real attention data, so
   * this is a best-effort proxy for "what changed before the AI said this" —
   * not a literal model explanation — used to highlight a region on the
   * "drawing that convinced it" callout. `null` when this was the first
   * guess of the round (no earlier stroke count to diff against).
   */
  newStrokeBounds: StrokeBounds | null;
}

/** One completed round's outcome, kept for the end-of-game results screen. */
export interface RoundSummary {
  round: number;
  prompt: string;
  guessed: boolean;
  matchedLabel: string | null;
  pointsAwarded: number;
  /** Base64 PNG of the canvas as it stood when the round ended. */
  finalSnapshot: string;
  /** This round's own guess history, so it can be replayed after the fact. */
  guessHistory: GuessHistoryEntry[];
}

/**
 * One finished game, kept in the local leaderboard. Written once, when the
 * game actually ends — never on page load/refresh, so an abandoned game
 * never pollutes the board.
 */
export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  /** ISO timestamp of when the game finished. */
  playedAt: string;
  /** Every round of this game, so past canvases can be reopened later. */
  roundSummaries: RoundSummary[];
}

export interface GameState {
  prompt: string;
  timeLeftSeconds: number;
  isDrawing: boolean;
  isRoundOver: boolean;
  score: number;
}

/** Outcome of a round, shown in the end-of-round overlay. */
export interface RoundResult {
  prompt: string;
  guessed: boolean;
  matchedLabel: string | null;
  pointsAwarded: number;
  reason: 'time-up' | 'guessed';
  /**
   * True while the final guess is still in flight. The overlay used to wait for
   * the AI before appearing at all, so a slow call looked like the game had
   * frozen. Now the card shows immediately in a pending state and the verdict
   * fills in underneath.
   */
  pending?: boolean;
}

/**
 * Static hand shapes recognised in addition to the pinch, used as one-shot
 * commands (hold briefly to fire) rather than continuous drawing input.
 */
export type HandGesture =
  | 'none'
  | 'pinch'
  | 'fist'
  | 'openPalm'
  | 'peace'
  | 'thumbsUp'
  | 'point';

// Hand landmark subset we care about (wrist + index fingertip)
// Full list: https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker
export interface HandTrackingResult {
  indexFingerTip: Point | null;
  isPinching: boolean; // thumb tip close to index tip == "pen down"
  handedness: 'Left' | 'Right' | null;
  /** 0-1 strength of the pinch, used for on-screen feedback. */
  pinchStrength: number;
  gesture: HandGesture;
}

export type WebcamStatus =
  | 'idle'
  | 'requesting-camera'
  | 'loading-model'
  | 'ready'
  | 'error';
