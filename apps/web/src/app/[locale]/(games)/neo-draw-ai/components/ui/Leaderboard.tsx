'use client';

import { X } from '@ncthub/ui/icons';
import { useState } from 'react';
import { loadLeaderboard } from '../../lib/leaderboard';
import type { LeaderboardEntry, RoundSummary } from '../../types';
import { RoundThumbnailGrid } from './RoundThumbnailGrid';

interface LeaderboardProps {
  onClose: () => void;
  onSelectRound: (summary: RoundSummary) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Local leaderboard, read from localStorage — reachable from the start
 * screen and the game-over screen. Picking a past game drills into its own
 * round grid; picking a round from there reopens the same replay overlay
 * used for the game currently in progress.
 */
export function Leaderboard({ onClose, onSelectRound }: LeaderboardProps) {
  // Lazy initializer: read once, the moment this modal mounts. It never
  // mounts during SSR (only opened by a button click after hydration), so
  // there's no server/client mismatch to worry about, and a finished game
  // only ever writes via saveLeaderboardEntry while this is unmounted.
  const [entries] = useState<LeaderboardEntry[]>(() => loadLeaderboard());
  const [selected, setSelected] = useState<LeaderboardEntry | null>(null);

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-nct-900/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="nct-rise flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-nct-steel/40 bg-nct-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="font-black text-lg text-nct-ink">
            {selected
              ? `${selected.name}'s game — ${formatDate(selected.playedAt)}`
              : 'Leaderboard'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="nct-focus shrink-0 rounded-full p-1 text-nct-muted transition hover:bg-nct-700 hover:text-nct-ink"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
          {selected ? (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="nct-focus self-start font-bold text-nct-steel-light text-xs uppercase tracking-wide hover:text-nct-ink"
              >
                ← Back to leaderboard
              </button>
              <RoundThumbnailGrid
                summaries={selected.roundSummaries}
                onSelectRound={onSelectRound}
              />
            </div>
          ) : entries.length === 0 ? (
            <p className="py-8 text-center text-nct-muted text-sm">
              No games finished yet — play a full game to get on the board.
            </p>
          ) : (
            <ol className="flex flex-col gap-1.5">
              {entries.map((entry, i) => {
                const wins = entry.roundSummaries.filter(
                  (s) => s.guessed
                ).length;
                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(entry)}
                      className="nct-focus flex w-full items-center gap-3 rounded-xl border border-nct-steel/20 bg-nct-900/40 px-3 py-2.5 text-left transition hover:bg-nct-700/60"
                    >
                      <span className="w-6 shrink-0 text-center font-black text-nct-muted text-sm">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-nct-ink text-sm">
                          {entry.name}
                        </span>
                        <span className="block text-[0.65rem] text-nct-muted">
                          {wins}/{entry.roundSummaries.length} guessed ·{' '}
                          {formatDate(entry.playedAt)}
                        </span>
                      </span>
                      <span className="shrink-0 font-black text-base text-nct-amber">
                        {entry.score.toLocaleString()}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
