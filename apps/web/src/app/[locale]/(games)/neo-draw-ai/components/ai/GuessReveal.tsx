'use client';

import { History, Sparkles } from '@ncthub/ui/icons';
import { labelMatchesPrompt } from '../../lib/prompts';
import type { AIGuessResponse, AIMode } from '../../types';

interface GuessRevealProps {
  result: AIGuessResponse | null;
  loading: boolean;
  mode: AIMode;
  geminiAvailable: boolean;
  onModeChange: (mode: AIMode) => void;
  prompt: string | null;
  liveGuessing: boolean;
  onLiveGuessingChange: (enabled: boolean) => void;
  onGuessNow: () => void;
  canGuess: boolean;
  /** True once this round's live-guess budget is spent (Gemini mode only). */
  liveBudgetSpent: boolean;
  /** Shown only while "Keep drawing" is active and there's a past guess to replay. */
  showHistoryButton: boolean;
  onShowHistory: () => void;
}

export function GuessReveal({
  result,
  loading,
  mode,
  geminiAvailable,
  onModeChange,
  prompt,
  liveGuessing,
  onLiveGuessingChange,
  onGuessNow,
  canGuess,
  liveBudgetSpent,
  showHistoryButton,
  onShowHistory,
}: GuessRevealProps) {
  // guesses[] is ordered most-likely-first (mock and Gemini both promise
  // this), so the top guess is simply the first entry.
  const top = result?.guesses[0] ?? null;
  const correct = top && prompt ? labelMatchesPrompt(top.label, prompt) : false;

  return (
    <div className="mx-auto flex w-full flex-col items-center gap-3">
      {/* Utility row — small and secondary; the reveal below is the star. */}
      <div className="mx-auto flex w-full max-w-md flex-wrap items-center justify-center gap-2 text-xs">
        <div className="flex gap-1 rounded-full bg-nct-900/60 p-1">
          {(['mock', 'gemini'] as AIMode[]).map((m) => {
            const locked = m === 'gemini' && !geminiAvailable;
            return (
              <button
                type="button"
                key={m}
                onClick={() => onModeChange(m)}
                disabled={locked}
                title={
                  locked
                    ? 'Set GEMINI_API_KEY in .env.local and restart the dev server to enable the real model'
                    : m === 'mock'
                      ? 'Simulated predictions — always available, no API key needed'
                      : 'Real predictions from the Gemini vision model'
                }
                className={`nct-focus rounded-full px-2.5 py-1 font-bold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  mode === m
                    ? 'bg-nct-steel text-nct-900'
                    : 'text-nct-muted hover:bg-nct-700/70 hover:text-nct-ink'
                }`}
              >
                {m === 'mock' ? 'Mock' : 'Gemini'}
              </button>
            );
          })}
        </div>

        <label className="flex cursor-pointer items-center gap-1.5 text-nct-muted">
          <input
            type="checkbox"
            checked={liveGuessing}
            onChange={(e) => onLiveGuessingChange(e.target.checked)}
            className="nct-focus relative h-4 w-8 cursor-pointer appearance-none rounded-full bg-nct-600 transition-colors after:absolute after:top-0.5 after:left-0.5 after:h-3 after:w-3 after:rounded-full after:bg-nct-ink after:transition-transform checked:bg-nct-steel checked:after:translate-x-4"
          />
          Live
        </label>

        <button
          type="button"
          onClick={onGuessNow}
          disabled={!canGuess || loading}
          className="nct-focus flex items-center gap-1 rounded-full bg-nct-amber px-3 py-1 font-black text-nct-900 uppercase tracking-wide transition hover:bg-nct-amber-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Sparkles size={13} fill="currentColor" aria-hidden="true" />
          {loading ? 'Thinking…' : 'Guess now'}
        </button>

        {showHistoryButton && (
          <button
            type="button"
            onClick={onShowHistory}
            className="nct-focus flex items-center gap-1 rounded-full border border-nct-steel/40 px-3 py-1 font-bold text-nct-muted uppercase tracking-wide transition hover:bg-nct-700/70 hover:text-nct-ink"
          >
            <History size={13} strokeWidth={2.5} aria-hidden="true" />
            How AI saw it
          </button>
        )}
      </div>

      {liveGuessing && liveBudgetSpent && (
        <p className="-mt-1 text-center text-[0.7rem] text-nct-muted">
          Live budget used this round — try{' '}
          <span className="font-semibold text-nct-ink">Guess now</span>.
        </p>
      )}

      <div
        className="flex min-h-[3.75rem] w-full flex-col items-center justify-center gap-1 px-2"
        aria-live="polite"
      >
        {loading && (
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 animate-pulse rounded-full bg-nct-steel"
                style={{ animationDelay: `${i * 160}ms` }}
              />
            ))}
          </div>
        )}

        {!loading && top && (
          <p
            data-testid="ai-guess-word"
            className={`nct-rise max-w-full -rotate-1 break-words text-center font-marker leading-tight ${
              correct ? 'text-nct-success' : 'text-nct-amber'
            }`}
            style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)' }}
          >
            {correct && '✓ '}
            {top.label}
          </p>
        )}

        {!loading && result && !top && !result.error && (
          <p className="text-nct-muted text-sm">
            No confident guess yet — add a few more strokes.
          </p>
        )}

        {!loading && !result && (
          <p className="text-nct-muted text-sm leading-relaxed">
            Draw something and the AI will guess along the way.
          </p>
        )}

        {!loading && result?.error && (
          <p className="max-w-sm text-center text-nct-danger text-xs leading-relaxed">
            {result.error}
          </p>
        )}
      </div>
    </div>
  );
}
