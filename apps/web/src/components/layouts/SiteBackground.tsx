// Ambient brand gradient wash for the public/marketing pages: a soft diagonal
// blend of brand blue (top-left) into brand yellow (bottom-right) at low
// opacity, fixed behind all content and non-interactive. Reads in light & dark.

const GRADIENT =
  'linear-gradient(135deg, hsl(193.2 41% 47.8% / 0.24) 0%, transparent 46%, transparent 54%, hsl(41.5 96.6% 54.5% / 0.22) 100%)';

export default function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ backgroundImage: GRADIENT }}
    />
  );
}
