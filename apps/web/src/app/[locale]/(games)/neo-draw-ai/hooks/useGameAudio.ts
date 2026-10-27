'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const MUSIC_VOLUME = 0.1;
const NEW_ROUND_VOLUME = 0.6;
const TICKING_VOLUME = 0.5;

// Browsers only allow autoplay (even muted) when every autoplay-related
// property is set BEFORE the element is inserted into the page — setting
// them after appendChild is silently ignored. So all options go through
// createElement here, and appendChild always comes last.
function makeAudio(
  src: string,
  volume: number,
  opts: { loop?: boolean; muted?: boolean; autoplay?: boolean } = {}
) {
  const el = document.createElement('audio');
  el.src = src;
  el.volume = volume;
  el.style.display = 'none';
  if (opts.loop) el.loop = true;
  if (opts.muted) el.muted = true;
  if (opts.autoplay) el.autoplay = true;
  document.body.appendChild(el);
  return el;
}

export function useGameAudio() {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const newRoundRef = useRef<HTMLAudioElement | null>(null);
  const tickingRef = useRef<HTMLAudioElement | null>(null);

  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(muted);
  const unlockedRef = useRef(false);

  useEffect(() => {
    mutedRef.current = muted;
    if (musicRef.current)
      musicRef.current.muted = muted || !unlockedRef.current;
    if (newRoundRef.current) newRoundRef.current.muted = muted;
    if (tickingRef.current) tickingRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    const alreadyActivated =
      typeof navigator !== 'undefined' &&
      'userActivation' in navigator &&
      navigator.userActivation.hasBeenActive;

    const music = makeAudio(
      '/neo-draw-ai/sound/background-music.mp3',
      MUSIC_VOLUME,
      {
        loop: true,
        muted: alreadyActivated ? mutedRef.current : true,
        autoplay: true,
      }
    );
    musicRef.current = music;
    unlockedRef.current = alreadyActivated;
    if (alreadyActivated) void music.play().catch(() => {});

    // fallback if `loop` doesn't fire for some reason
    const onEnded = () => {
      music.currentTime = 0;
      void music.play().catch(() => {});
    };
    music.addEventListener('ended', onEnded);

    const newRound = makeAudio(
      '/neo-draw-ai/sound/new-round.wav',
      NEW_ROUND_VOLUME
    );
    newRoundRef.current = newRound;

    const ticking = makeAudio(
      '/neo-draw-ai/sound/ticking-sound.wav',
      TICKING_VOLUME
    );
    tickingRef.current = ticking;

    const unlockMusic = () => {
      unlockedRef.current = true;
      music.muted = mutedRef.current;
      if (music.paused) void music.play().catch(() => {}); // safety net
    };
    window.addEventListener('pointerdown', unlockMusic, { once: true });
    window.addEventListener('keydown', unlockMusic, { once: true });

    // Silence the game while its browser tab is in the background.
    const onVisibilityChange = () => {
      if (document.hidden) {
        music.pause();
        ticking.pause();
      } else if (unlockedRef.current) {
        void music.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('pointerdown', unlockMusic);
      window.removeEventListener('keydown', unlockMusic);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      music.removeEventListener('ended', onEnded);
      // pause first — removing an element from the DOM doesn't stop it playing
      music.pause();
      newRound.pause();
      ticking.pause();
      music.remove();
      newRound.remove();
      ticking.remove();
      // Async game work (a pending AI guess, the countdown) can still call
      // playNewRound/startTicking after navigation; detached audio would play.
      musicRef.current = null;
      newRoundRef.current = null;
      tickingRef.current = null;
    };
  }, []);

  const playNewRound = useCallback(() => {
    const el = newRoundRef.current;
    if (!el) return;
    el.currentTime = 0;
    void el.play().catch(() => {});
  }, []);

  const startTicking = useCallback(() => {
    const el = tickingRef.current;
    if (!el) return;
    el.currentTime = 0;
    void el.play().catch(() => {});
  }, []);

  const stopTicking = useCallback(() => {
    const el = tickingRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  return { muted, toggleMuted, playNewRound, startTicking, stopTicking };
}
