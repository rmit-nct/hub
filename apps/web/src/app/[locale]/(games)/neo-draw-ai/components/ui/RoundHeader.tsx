'use client';

import { useEffect, useRef, useState } from 'react';
import { NctMark } from '../brand/NctLogo';

interface RoundHeaderProps {
  prompt: string | null;
  secondsLeft: number;
  totalSeconds: number;
  score: number;
  round: number;
  totalRounds: number;
  isRoundOver: boolean;
  onNewRound: () => void;
  muted: boolean;
  onToggleMuted: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const RING_RADIUS = 27;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function useCountUp(value: number, durationMs = 600) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || value === fromRef.current) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }

    const from = fromRef.current;
    const delta = value - from;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(from + delta * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs]);

  return display;
}

export function RoundHeader({
  prompt,
  secondsLeft,
  totalSeconds,
  score,
  round,
  totalRounds,
  isRoundOver,
  onNewRound,
  muted,
  onToggleMuted,
}: RoundHeaderProps) {
  const pct = Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100));
  const urgent = secondsLeft <= 10 && secondsLeft > 0 && !isRoundOver;
  const displayedScore = useCountUp(score);

  return (
    <header className="relative z-10 w-full">
      <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-4 px-4 py-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <NctMark className="h-11 w-auto shrink-0" />
          <div>
            <h1 className="font-black text-nct-ink text-xl leading-none tracking-tight sm:text-2xl">
              NEO <span className="text-nct-amber">DRAW</span>
              <span className="text-nct-steel-light">AI</span>
            </h1>
            <p className="mt-1 font-bold text-[0.65rem] text-nct-muted tracking-[0.18em]">
              NEO CULTURE TECH
            </p>
          </div>
        </div>

        {/* Prompt */}
        <div className="order-3 w-full sm:order-none sm:flex sm:flex-1 sm:justify-center">
          <div className="nct-panel flex items-center gap-3 px-4 py-2.5">
            <span className="nct-label shrink-0">Your word</span>
            <span
              className="truncate font-black text-nct-amber text-xl uppercase tracking-wide sm:text-2xl"
              aria-live="polite"
            >
              {prompt ?? '…'}
            </span>
          </div>
        </div>

        {/* Timer + score */}
        <div className="ml-auto flex items-center gap-3">
          <div className="nct-scoreboard flex items-stretch divide-x divide-nct-steel/20 px-2.5 py-1 sm:px-3 sm:py-1.5">
            <div className="pr-2.5 text-right sm:pr-3">
              <div className="nct-label">Score</div>
              <div
                className="font-black font-mono text-lg text-nct-ink tabular-nums tracking-wide sm:text-xl"
                role="status"
                aria-atomic="true"
              >
                <span aria-hidden="true" data-testid="score-value">
                  {displayedScore.toLocaleString()}
                </span>
                <span className="sr-only" aria-live="polite">
                  Score {score.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="pl-2.5 text-right sm:pl-3">
              <div className="nct-label">Round</div>
              <div className="font-black font-mono text-lg text-nct-ink tabular-nums tracking-wide sm:text-xl">
                {round}/{totalRounds}
              </div>
            </div>
          </div>

          <div
            className={`relative grid h-16 w-16 shrink-0 place-items-center ${urgent ? 'nct-pulse' : ''}`}
            title="Time left"
          >
            <svg
              viewBox="0 0 64 64"
              className="absolute inset-0 -rotate-90"
              aria-hidden="true"
            >
              <circle
                cx="32"
                cy="32"
                r={RING_RADIUS}
                fill="none"
                strokeWidth="5"
                stroke="currentColor"
                className="text-nct-steel/20"
              />
              <circle
                cx="32"
                cy="32"
                r={RING_RADIUS}
                fill="none"
                strokeWidth="5"
                strokeLinecap="round"
                stroke="currentColor"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - pct / 100)}
                className={`transition-[stroke-dashoffset] duration-300 ease-linear ${
                  urgent ? 'text-nct-danger' : 'text-nct-amber'
                }`}
              />
            </svg>
            <div
              className={`font-black font-mono text-sm tabular-nums ${
                urgent
                  ? 'text-nct-danger'
                  : isRoundOver
                    ? 'text-nct-muted'
                    : 'text-nct-ink'
              }`}
              role="timer"
              aria-live="off"
            >
              {formatTime(secondsLeft)}
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleMuted}
            aria-pressed={muted}
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            title={muted ? 'Unmute sound' : 'Mute sound'}
            data-testid="mute-toggle"
            className="nct-focus grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-nct-steel/30 text-nct-steel-light transition hover:bg-nct-700"
          >
            {muted ? (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                <line x1="16" y1="9" x2="22" y2="15" />
                <line x1="22" y1="9" x2="16" y2="15" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                <path d="M18 6a9 9 0 0 1 0 12" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={onNewRound}
            className="nct-focus rounded-xl bg-nct-steel px-4 py-3 font-black text-nct-900 text-sm uppercase tracking-wide transition hover:bg-nct-steel-light"
          >
            New round
          </button>
        </div>
      </div>
    </header>
  );
}
