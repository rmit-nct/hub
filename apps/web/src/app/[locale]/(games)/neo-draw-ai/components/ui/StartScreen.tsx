'use client';

import { NctMark } from '../brand/NctLogo';

interface StartScreenProps {
  totalRounds: number;
  name: string;
  onNameChange: (name: string) => void;
  onStart: () => void;
  onViewLeaderboard: () => void;
}

/** First thing a player sees — the round timer doesn't start ticking until they press this. */
export function StartScreen({
  totalRounds,
  name,
  onNameChange,
  onStart,
  onViewLeaderboard,
}: StartScreenProps) {
  const canStart = name.trim().length > 0;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <NctMark className="h-16 w-auto" />

      <div>
        <h1 className="font-black text-3xl text-nct-ink leading-none tracking-tight sm:text-4xl">
          NEO <span className="text-nct-amber">DRAW</span>
          <span className="text-nct-steel-light">AI</span>
        </h1>
        <p className="mt-2 font-bold text-nct-muted text-xs tracking-[0.18em]">
          NEO CULTURE TECH
        </p>
      </div>

      <ol className="nct-panel w-full space-y-2.5 p-5 text-left text-nct-muted text-sm leading-relaxed">
        <li>
          <span className="font-bold text-nct-ink">1.</span> Draw the word at
          the top before the timer runs out.
        </li>
        <li>
          <span className="font-bold text-nct-ink">2.</span> The AI guesses as
          you go — get it as the top guess for the most points.
        </li>
        <li>
          <span className="font-bold text-nct-ink">3.</span> Play {totalRounds}{' '}
          rounds, then see how every drawing stacked up on the results screen.
        </li>
      </ol>

      <div className="w-full text-left">
        <label htmlFor="player-name" className="nct-label">
          Your name
        </label>
        <input
          id="player-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canStart) onStart();
          }}
          maxLength={24}
          placeholder="Enter a name for the leaderboard"
          className="nct-focus mt-1.5 w-full rounded-xl border border-nct-steel/40 bg-nct-900/60 px-4 py-2.5 text-nct-ink text-sm placeholder:text-nct-muted"
        />
      </div>

      <button
        type="button"
        onClick={onStart}
        disabled={!canStart}
        className="nct-focus w-full rounded-xl bg-nct-amber px-6 py-3.5 font-black text-base text-nct-900 uppercase tracking-wide transition hover:bg-nct-amber-light disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-10"
      >
        Start game
      </button>

      <button
        type="button"
        onClick={onViewLeaderboard}
        className="nct-focus font-bold text-nct-steel-light text-xs uppercase tracking-wide underline underline-offset-2 hover:text-nct-ink"
      >
        View leaderboard
      </button>
    </div>
  );
}
