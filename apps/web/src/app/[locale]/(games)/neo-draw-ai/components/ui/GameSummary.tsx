'use client';

import type { RoundSummary } from '../../types';
import { RoundThumbnailGrid } from './RoundThumbnailGrid';

interface GameSummaryProps {
  summaries: RoundSummary[];
  score: number;
  onSelectRound: (summary: RoundSummary) => void;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
}

/**
 * Quick, Draw!-style results screen: every round's final drawing in a grid,
 * win/lose marked, tap one to replay how the AI read it.
 */
export function GameSummary({
  summaries,
  score,
  onSelectRound,
  onPlayAgain,
  onViewLeaderboard,
}: GameSummaryProps) {
  const wins = summaries.filter((s) => s.guessed).length;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-6 px-4 py-10 text-center">
      <div>
        <p className="nct-label">Game over</p>
        <h2 className="mt-2 font-black text-3xl text-nct-ink tracking-tight sm:text-4xl">
          {wins} / {summaries.length} guessed —{' '}
          <span className="text-nct-amber">{score.toLocaleString()} pts</span>
        </h2>
        <p className="mt-2 text-nct-muted text-sm">
          Tap a drawing to see how the AI read it.
        </p>
      </div>

      <RoundThumbnailGrid summaries={summaries} onSelectRound={onSelectRound} />

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onViewLeaderboard}
          className="nct-focus rounded-xl border border-nct-steel/40 px-6 py-3 font-black text-nct-ink text-sm uppercase tracking-wide transition hover:bg-nct-700"
        >
          Leaderboard
        </button>
        <button
          type="button"
          onClick={onPlayAgain}
          className="nct-focus rounded-xl bg-nct-amber px-6 py-3 font-black text-nct-900 text-sm uppercase tracking-wide transition hover:bg-nct-amber-light"
        >
          Play again
        </button>
      </div>
    </div>
  );
}
