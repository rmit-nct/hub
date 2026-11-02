import type { GuessHistoryEntry } from '../../types';
import { labelMatchesPrompt } from '../prompts';

/**
 * Of every guess the AI made this round, which snapshot pushed its confidence
 * in `prompt` the highest — the drawing that actually convinced it, not
 * whichever one happened to be shown last.
 */
export function findWinningEntry(
  history: GuessHistoryEntry[],
  prompt: string
): { entry: GuessHistoryEntry; confidence: number } | null {
  let best: { entry: GuessHistoryEntry; confidence: number } | null = null;
  for (const entry of history) {
    const match = entry.guesses.find((g) =>
      labelMatchesPrompt(g.label, prompt)
    );
    if (match && (!best || match.confidence > best.confidence)) {
      best = { entry, confidence: match.confidence };
    }
  }
  return best;
}
