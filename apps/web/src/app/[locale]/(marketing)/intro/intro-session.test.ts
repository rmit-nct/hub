import { beforeEach, describe, expect, it } from 'vitest';
import { markIntroPlayed, shouldPlayIntro } from './intro-session';

describe('intro-session', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('plays when the session flag is absent', () => {
    expect(shouldPlayIntro()).toBe(true);
  });

  it('does not play once marked as played', () => {
    markIntroPlayed();
    expect(shouldPlayIntro()).toBe(false);
  });

  it('persists the played flag in sessionStorage', () => {
    markIntroPlayed();
    expect(window.sessionStorage.getItem('nct_intro_played')).toBe('true');
  });
});
