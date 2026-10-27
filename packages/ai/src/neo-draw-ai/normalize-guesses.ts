export interface AIGuessResult {
  label: string;
  confidence: number; // 0 - 1
}

/** Never trust the model's values — coerce and clamp before they reach the UI. */
export function normalizeGuesses(raw: unknown): AIGuessResult[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const { label, confidence } = item as {
        label?: unknown;
        confidence?: unknown;
      };
      if (typeof label !== 'string' || label.trim() === '') return null;
      const numeric =
        typeof confidence === 'number' && Number.isFinite(confidence)
          ? confidence
          : 0;
      return {
        label: label.trim().slice(0, 40),
        // Models sometimes answer 85 instead of 0.85.
        confidence: Math.max(
          0,
          Math.min(1, numeric > 1 ? numeric / 100 : numeric)
        ),
      };
    })
    .filter((g): g is AIGuessResult => g !== null)
    .slice(0, 3);
}
