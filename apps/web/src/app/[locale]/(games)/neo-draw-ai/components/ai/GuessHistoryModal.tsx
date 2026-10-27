'use client';

import { X } from '@ncthub/ui/icons';
import { findWinningEntry } from '../../lib/ai/guessHistory';
import type { GuessHistoryEntry } from '../../types';
import { AIConvincedCard } from './AIConvincedCard';
import { GuessHistoryStrip } from './GuessHistoryStrip';

interface GuessHistoryModalProps {
  history: GuessHistoryEntry[];
  prompt: string | null;
  guessed: boolean;
  matchedLabel: string | null;
  onClose: () => void;
}

/**
 * On-demand replay of the last completed round's guesses — for a player who
 * pressed "Keep drawing" and wants another look without ending the round
 * again to get back to the reveal card.
 */
export function GuessHistoryModal({
  history,
  prompt,
  guessed,
  matchedLabel,
  onClose,
}: GuessHistoryModalProps) {
  const winning = guessed && prompt ? findWinningEntry(history, prompt) : null;

  return (
    <div
      className="absolute inset-0 z-20 grid place-items-center bg-nct-900/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="nct-rise w-full max-w-sm rounded-2xl border border-nct-steel/40 bg-nct-800 p-6 shadow-2xl sm:max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="font-black text-nct-ink text-sm">
            Replay: how the AI saw your drawing
          </p>
          <button
            type="button"
            onClick={onClose}
            className="nct-focus shrink-0 rounded-full p-1 text-nct-muted transition hover:bg-nct-700 hover:text-nct-ink"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {winning && matchedLabel && (
          <div className="mt-4">
            <AIConvincedCard
              snapshot={winning.entry.snapshot}
              confidence={winning.confidence}
              label={matchedLabel}
              bounds={winning.entry.newStrokeBounds}
            />
          </div>
        )}

        <GuessHistoryStrip
          history={history}
          highlightId={winning?.entry.id ?? null}
        />
      </div>
    </div>
  );
}
