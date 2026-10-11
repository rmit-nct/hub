const INTRO_PLAYED_KEY = 'nct_intro_played';

export function shouldPlayIntro(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(INTRO_PLAYED_KEY) !== 'true';
  } catch {
    return false;
  }
}

export function markIntroPlayed(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(INTRO_PLAYED_KEY, 'true');
  } catch {
    // Storage can be unavailable (private mode); fail silently.
  }
}
