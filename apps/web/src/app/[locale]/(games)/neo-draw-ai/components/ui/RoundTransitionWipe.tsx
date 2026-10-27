'use client';

export function RoundTransitionWipe() {
  return (
    <div
      aria-hidden="true"
      data-testid="round-wipe"
      className="nct-round-wipe pointer-events-none absolute inset-0 z-20"
    />
  );
}
