'use client';

import type { GuessHistoryEntry } from '../../types';

interface GuessHistoryStripProps {
  history: GuessHistoryEntry[];
  /** Id of the entry that clinched the correct guess, if any — called out with a ring + star. */
  highlightId?: number | null;
}

/**
 * Quick, Draw!-style replay: a strip of snapshots of the drawing at each guess
 * the AI made during the round, alongside its top guess at that moment — lets
 * the player see how the AI's read of the drawing evolved as it grew.
 */
export function GuessHistoryStrip({
  history,
  highlightId = null,
}: GuessHistoryStripProps) {
  if (history.length === 0) return null;

  return (
    <div className="mt-5 border-nct-steel/20 border-t pt-4 text-left">
      <p className="nct-label">How the AI saw it</p>
      {/* pt-1.5 gives the badge below room to sit inside the scroll container —
          overflow-x-auto with no explicit overflow-y forces the browser to
          clip that axis too, so anything poking above row 0 would be cut off. */}
      <div className="mt-2.5 flex gap-2.5 overflow-x-auto pt-1.5 pb-1">
        {history.map((entry) => {
          const top = entry.guesses[0];
          const isWinner = entry.id === highlightId;
          return (
            <div
              key={entry.id}
              className="flex w-20 shrink-0 flex-col items-center gap-1.5"
            >
              <div className="relative">
                {/* biome-ignore lint/performance/noImgElement: data: URI snapshot, not an optimizable asset */}
                <img
                  src={`data:image/png;base64,${entry.snapshot}`}
                  alt={`Drawing after ${entry.strokeCount} stroke${entry.strokeCount === 1 ? '' : 's'}`}
                  className={`h-14 w-20 rounded-lg border bg-white object-contain ${
                    isWinner
                      ? 'border-nct-success ring-2 ring-nct-success'
                      : 'border-nct-steel/30'
                  }`}
                />
                {isWinner && (
                  <span
                    className="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-nct-success text-[0.55rem] text-nct-900 leading-none"
                    title="This is the drawing that convinced the AI"
                  >
                    ★
                  </span>
                )}
              </div>
              <p
                className={`w-full truncate text-center font-bold text-[0.65rem] capitalize ${
                  isWinner ? 'text-nct-success' : 'text-nct-ink'
                }`}
              >
                {top ? top.label : '—'}
              </p>
              {top && (
                <p className="text-[0.6rem] text-nct-muted">
                  {Math.round(top.confidence * 100)}%
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
