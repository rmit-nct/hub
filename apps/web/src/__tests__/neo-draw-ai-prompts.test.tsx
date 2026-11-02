import { describe, expect, it } from 'vitest';
import { isWrongGuess } from '@/app/[locale]/(games)/neo-draw-ai/lib/prompts';

describe('isWrongGuess', () => {
  it('is true when no guess matches the prompt', () => {
    expect(isWrongGuess([{ label: 'dog' }, { label: 'fox' }], 'cat')).toBe(
      true
    );
  });

  it('is false when any guess matches, not just the top one', () => {
    expect(isWrongGuess([{ label: 'dog' }, { label: 'Cats' }], 'cat')).toBe(
      false
    );
  });

  it('is false when there is nothing to judge', () => {
    expect(isWrongGuess([], 'cat')).toBe(false);
    expect(isWrongGuess([{ label: 'dog' }], null)).toBe(false);
  });
});
