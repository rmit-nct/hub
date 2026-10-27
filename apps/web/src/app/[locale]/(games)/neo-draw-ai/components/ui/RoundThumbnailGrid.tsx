'use client';

import type { RoundSummary } from '../../types';

interface RoundThumbnailGridProps {
  summaries: RoundSummary[];
  onSelectRound: (summary: RoundSummary) => void;
}

/**
 * Quick, Draw!-style grid of every round's final drawing, win/lose marked.
 * Shared by the current game's results screen and a past game's leaderboard
 * entry — tap one to replay how the AI read it.
 */
export function RoundThumbnailGrid({
  summaries,
  onSelectRound,
}: RoundThumbnailGridProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {summaries.map((summary) => (
        <button
          type="button"
          key={summary.round}
          onClick={() => onSelectRound(summary)}
          className={`nct-focus flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition hover:-translate-y-0.5 ${
            summary.guessed
              ? 'border-nct-success/50 bg-nct-success/10 hover:bg-nct-success/15'
              : 'border-nct-danger/40 bg-nct-danger/10 hover:bg-nct-danger/15'
          }`}
        >
          <div className="relative w-full">
            {/* biome-ignore lint/performance/noImgElement: data: URI snapshot, not an optimizable asset */}
            <img
              src={`data:image/png;base64,${summary.finalSnapshot}`}
              alt={`Round ${summary.round}: ${summary.prompt}`}
              className="aspect-[4/3] w-full rounded-lg border border-nct-steel/20 bg-white object-contain"
            />
            <span
              className={`absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full font-black text-[0.65rem] text-nct-900 ${
                summary.guessed ? 'bg-nct-success' : 'bg-nct-danger'
              }`}
            >
              {summary.guessed ? '✓' : '✕'}
            </span>
          </div>
          <p className="w-full truncate font-bold text-nct-ink text-xs capitalize">
            {summary.prompt}
          </p>
          <p className="text-[0.65rem] text-nct-muted">Round {summary.round}</p>
        </button>
      ))}
    </div>
  );
}
