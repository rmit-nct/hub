/**
 * The Neo Culture Tech "N" mark, traced from the logo in the project brief.
 *
 * Three angled slabs — navy / steel / navy — each with the signature amber
 * offset behind it. Drawn as vectors so it stays crisp at any size and can be
 * recoloured by the surface it sits on.
 */

const NAVY = '#1F2844';
const STEEL = '#5095AA';
const AMBER = '#F8B73A';

const SHAPES: Array<{ points: string; fill: string }> = [
  // amber offsets (painted first, so they read as a light source behind the slabs)
  {
    points: '71,44.5 66.5,12 63,6.5 56.5,3 59,1.5 68,3.5 73.5,9 76.5,35',
    fill: AMBER,
  },
  {
    points:
      '80,87.5 74.5,87 105.5,34 104,30.5 97.5,27 104,24.5 111,28.5 112.5,32',
    fill: AMBER,
  },
  { points: '33,69.5 31.5,68 44,45.5 45.5,54 38.5,67', fill: AMBER },
  // navy slabs
  { points: '30,69.5 9.5,58 39,7.5 44.5,45', fill: NAVY },
  {
    points:
      '76,83.5 70.5,50 71.5,43 69.5,41 73,41.5 80,30.5 96,26.5 104.5,31 104.5,35',
    fill: NAVY,
  },
  // steel centre slab
  {
    points:
      '74,87.5 59,87.5 50.5,82 40.5,20 39.5,8 41,6.5 56,3.5 65.5,11 76.5,84',
    fill: STEEL,
  },
];

export function NctMark({ className = 'h-9 w-auto' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 90"
      className={className}
      role="img"
      aria-label="Neo Culture Tech"
      fill="none"
    >
      {SHAPES.map((shape, i) => (
        <polygon
          key={i}
          points={shape.points}
          fill={shape.fill}
          stroke={shape.fill}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/** Full lockup: mark + "NEO CULTURE TECH" wordmark, as on the brief's cover. */
export function NctLockup({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <NctMark className="h-10 w-auto shrink-0" />
      <div className="leading-none">
        <div className="font-black text-[0.95rem] text-nct-ink tracking-[0.14em]">
          NEO CULTURE <span className="text-nct-steel-light">TECH</span>
        </div>
        <div className="mt-1 h-[3px] w-full rounded-full bg-nct-amber" />
      </div>
    </div>
  );
}
