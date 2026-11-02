import type { LeaderboardEntry, RoundSummary } from '../types';

const STORAGE_KEY = 'neo-drawai-leaderboard';
// Each entry carries full round snapshots (base64 PNGs), so cap how many
// finished games localStorage has to hold.
const MAX_ENTRIES = 30;

function readRaw(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupt JSON, private-browsing quota, or storage disabled — treat as empty.
    return [];
  }
}

/** All saved games, best score first. */
export function loadLeaderboard(): LeaderboardEntry[] {
  return readRaw().sort(
    (a, b) => b.score - a.score || b.playedAt.localeCompare(a.playedAt)
  );
}

/**
 * Records one finished game. Called exactly once, from the moment the game
 * actually ends — never from a mount/refresh effect — so reloading the page
 * mid-game can't add a phantom entry.
 */
export function saveLeaderboardEntry(entry: {
  name: string;
  score: number;
  roundSummaries: RoundSummary[];
}): LeaderboardEntry[] {
  const next: LeaderboardEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: entry.name.trim() || 'Player',
    score: entry.score,
    playedAt: new Date().toISOString(),
    roundSummaries: entry.roundSummaries,
  };

  const updated = [...readRaw(), next]
    .sort((a, b) => b.score - a.score || b.playedAt.localeCompare(a.playedAt))
    .slice(0, MAX_ENTRIES);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Quota exceeded or storage disabled — the game itself still finished fine.
    }
  }

  return updated;
}
