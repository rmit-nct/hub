import type { AIGuessResponse } from '../../types';
import { CONFUSION_SETS, DRAWING_PROMPTS } from '../prompts';

/**
 * Mock prediction system — the fallback the project spec explicitly allows
 * while the real model is being validated. It runs entirely in the browser, so
 * the game is always playable and demoable with no API key configured.
 *
 * It returns the same `AIGuessResponse` shape as `/api/guess`, so the UI is
 * identical either way; the only difference is the `isMock` flag, which the UI
 * surfaces honestly rather than passing mock output off as a real prediction.
 *
 * The mock is deliberately *plausible* rather than random: it improves with the
 * number of strokes drawn and offers near-miss alternatives, so a demo shows
 * realistic behaviour instead of three unrelated words.
 */

export interface MockGuessOptions {
  /** The current round's word — the mock "recognises" it some of the time. */
  prompt?: string | null;
  /** More strokes => more confident, like a real recogniser warming up. */
  strokeCount?: number;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function getMockGuess(
  options: MockGuessOptions = {}
): Promise<AIGuessResponse> {
  const { prompt = null, strokeCount = 0 } = options;

  // Simulated latency so loading states are exercised in demos and tests.
  await new Promise((resolve) =>
    setTimeout(resolve, 350 + Math.random() * 250)
  );

  // Confidence that the mock "recognises" the drawing grows with effort:
  // a single stroke is rarely legible, ~8 strokes usually is.
  const recognitionChance = Math.min(0.85, 0.15 + strokeCount * 0.09);
  const recognised =
    prompt !== null && strokeCount > 0 && Math.random() < recognitionChance;

  const nearMisses = prompt ? (CONFUSION_SETS[prompt] ?? []) : [];
  const filler = shuffle(
    DRAWING_PROMPTS.filter((w) => w !== prompt && !nearMisses.includes(w))
  );

  const labels: string[] = [];
  if (recognised && prompt) labels.push(prompt);
  labels.push(...shuffle(nearMisses).slice(0, 3 - labels.length));
  while (labels.length < 3) {
    const next = filler.pop();
    if (!next) break;
    labels.push(next);
  }

  const top = recognised
    ? 0.62 + Math.random() * 0.3
    : 0.28 + Math.random() * 0.25;
  const guesses = labels.slice(0, 3).map((label, i) => ({
    label,
    confidence: Number(
      Math.max(0.04, top - i * (0.12 + Math.random() * 0.1)).toFixed(2)
    ),
  }));

  return { guesses, isMock: true };
}
