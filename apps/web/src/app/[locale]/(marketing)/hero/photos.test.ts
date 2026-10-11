import { describe, expect, it } from 'vitest';
import { heroPhotos } from './photos';

describe('heroPhotos', () => {
  it('has at least one photo', () => {
    expect(heroPhotos.length).toBeGreaterThan(0);
  });

  it('every photo has a non-empty src and alt', () => {
    for (const photo of heroPhotos) {
      expect(photo.src).toBeTruthy();
      expect(photo.alt).toBeTruthy();
    }
  });
});
