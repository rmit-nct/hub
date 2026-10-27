'use client';

import { findWinningEntry } from '../../lib/ai/guessHistory';
import type { GuessHistoryEntry, RoundResult } from '../../types';
import { AIConvincedCard } from '../ai/AIConvincedCard';
import { GuessHistoryStrip } from '../ai/GuessHistoryStrip';

interface RoundOverlayProps {
  result: RoundResult | null;
  /** Seconds remaining in the "AI got it" countdown, or null when inactive. */
  correctGuessCountdown: number | null;
  /** Every guess the AI made this round, oldest first — shown once the round ends. */
  guessHistory: GuessHistoryEntry[];
  /** True on the last round of the game — relabels the advance button. */
  isFinalRound: boolean;
  onNewRound: () => void;
  onKeepDrawing: () => void;
}

/** End-of-round card, shown over the canvas when the clock runs out. */
export function RoundOverlay({
  result,
  correctGuessCountdown,
  guessHistory,
  isFinalRound,
  onNewRound,
  onKeepDrawing,
}: RoundOverlayProps) {
  // Shown the instant the AI matches the prompt, before the round actually
  // ends — gives the drawer a beat to notice before the reveal card appears.
  if (correctGuessCountdown !== null) {
    return (
      <div className="absolute inset-0 z-10 grid place-items-center bg-nct-900/85 p-4 backdrop-blur-sm">
        <div className="text-center">
          <p className="nct-label text-nct-success">The AI got it!</p>
          <p
            key={correctGuessCountdown}
            className="nct-countdown-pop mt-2 font-black text-[8rem] text-nct-success leading-none sm:text-[10rem]"
            aria-live="assertive"
          >
            {correctGuessCountdown}
          </p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const winning = result.guessed
    ? findWinningEntry(guessHistory, result.prompt)
    : null;

  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-nct-900/85 p-4 backdrop-blur-sm">
      <div className="nct-rise w-full max-w-sm rounded-2xl border border-nct-steel/40 bg-nct-800 p-6 text-center shadow-2xl sm:max-w-md">
        {/* The clock has already stopped, but the final guess may still be in
            flight. Show the card straight away rather than making the player
            stare at a live canvas that no longer accepts strokes. */}
        {result.pending ? (
          <>
            <p className="nct-label">Time&apos;s up</p>
            <p className="mt-3 font-black text-2xl text-nct-ink tracking-tight">
              Checking your drawing&hellip;
            </p>
            <div
              className="mt-4 flex justify-center gap-1.5"
              aria-live="polite"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 animate-pulse rounded-full bg-nct-steel"
                  style={{ animationDelay: `${i * 160}ms` }}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="nct-label">
              {result.guessed ? 'Nice drawing' : "Time's up"}
            </p>

            <p className="mt-3 font-black text-2xl text-nct-ink tracking-tight">
              {result.guessed ? (
                <>
                  The AI guessed{' '}
                  <span className="text-nct-success capitalize">
                    {result.matchedLabel}
                  </span>
                </>
              ) : (
                <>
                  The AI didn&apos;t get{' '}
                  <span className="text-nct-amber capitalize">
                    {result.prompt}
                  </span>
                </>
              )}
            </p>

            <p className="mt-2 text-nct-muted text-sm">
              {result.guessed
                ? `+${result.pointsAwarded} points`
                : 'No points this round — try bolder, simpler shapes.'}
            </p>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={onKeepDrawing}
                className="nct-focus flex-1 rounded-xl border border-nct-steel/40 px-4 py-2.5 font-bold text-nct-ink text-sm transition hover:bg-nct-700"
              >
                Keep drawing
              </button>
              <button
                type="button"
                onClick={onNewRound}
                className="nct-focus flex-1 rounded-xl bg-nct-amber px-4 py-2.5 font-black text-nct-900 text-sm uppercase tracking-wide transition hover:bg-nct-amber-light"
              >
                {isFinalRound ? 'See results' : 'New round'}
              </button>
            </div>

            {winning && result.matchedLabel && (
              <div className="mt-5">
                <AIConvincedCard
                  snapshot={winning.entry.snapshot}
                  confidence={winning.confidence}
                  label={result.matchedLabel}
                  bounds={winning.entry.newStrokeBounds}
                />
              </div>
            )}

            <GuessHistoryStrip
              history={guessHistory}
              highlightId={winning?.entry.id ?? null}
            />
          </>
        )}
      </div>
    </div>
  );
}
