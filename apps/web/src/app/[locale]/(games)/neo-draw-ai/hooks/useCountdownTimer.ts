'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCountdownTimerOptions {
  /** Begin counting down as soon as the hook mounts. */
  autoStart?: boolean;
  onExpire?: () => void;
}

/**
 * Round countdown.
 *
 * Three problems in the previous version are fixed here:
 *  - `onExpire` was an effect dependency, so an inline arrow from the caller
 *    tore down and rebuilt the interval on *every* render, resetting the 1s
 *    window each time. It now lives in a ref.
 *  - `onExpire()` was called from inside a `setState` updater. Updaters must be
 *    pure — React can run them twice (StrictMode) or discard the result, which
 *    made the callback fire twice or not at all. Expiry is now its own effect.
 *  - The timer never started on page load; `autoStart` fixes the dead first round.
 *
 * The deadline is tracked as a wall-clock timestamp rather than by decrementing
 * a counter, so a throttled background tab (or a slow frame) can't make the
 * round run long.
 */
export function useCountdownTimer(
  initialSeconds: number,
  { autoStart = false, onExpire }: UseCountdownTimerOptions = {}
) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  const deadlineRef = useRef<number | null>(null);
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: deps intentionally narrowed, see comment in the hook body
  useEffect(() => {
    if (!isRunning) return;

    if (deadlineRef.current === null) {
      deadlineRef.current = Date.now() + secondsLeft * 1000;
    }

    const tick = () => {
      const remainingMs = (deadlineRef.current ?? Date.now()) - Date.now();
      setSecondsLeft(Math.max(0, Math.ceil(remainingMs / 1000)));
    };

    tick();
    const id = setInterval(tick, 250); // sub-second polling keeps the display honest
    return () => clearInterval(id);
    // `secondsLeft` is intentionally not a dependency: it is read once to build
    // the deadline, and re-running on every tick would restart the interval.
  }, [isRunning]);

  // Expiry as its own effect — a side effect, not part of a state updater.
  useEffect(() => {
    if (!isRunning || secondsLeft > 0 || hasExpiredRef.current) return;
    hasExpiredRef.current = true;
    setIsRunning(false);
    deadlineRef.current = null;
    onExpireRef.current?.();
  }, [isRunning, secondsLeft]);

  const start = useCallback(() => {
    hasExpiredRef.current = false;
    setIsRunning((running) => {
      if (!running) deadlineRef.current = null; // rebuilt from secondsLeft on the next effect run
      return true;
    });
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (deadlineRef.current !== null) {
      setSecondsLeft(
        Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000))
      );
    }
    deadlineRef.current = null;
  }, []);

  const reset = useCallback(
    (seconds = initialSeconds) => {
      hasExpiredRef.current = false;
      deadlineRef.current = null;
      setIsRunning(false);
      setSecondsLeft(seconds);
    },
    [initialSeconds]
  );

  /** reset + start in one call, so a new round can't race the two state updates. */
  const restart = useCallback(
    (seconds = initialSeconds) => {
      hasExpiredRef.current = false;
      deadlineRef.current = Date.now() + seconds * 1000;
      setSecondsLeft(seconds);
      setIsRunning(true);
    },
    [initialSeconds]
  );

  return { secondsLeft, isRunning, start, pause, reset, restart };
}
