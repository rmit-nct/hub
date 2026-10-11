// Ambient radial brand glow for the public/marketing pages. Fixed, behind all
// content, non-interactive. Theme handled via the `dark:` class variant so this
// works in a server component (no `useTheme`).

const GLOW_LIGHT =
  'radial-gradient(60% 50% at 50% 28%, hsl(193.2 41% 47.8% / 0.10), hsl(41.5 96.6% 54.5% / 0.05) 45%, transparent 75%)';
const GLOW_DARK =
  'radial-gradient(60% 50% at 50% 28%, hsl(192.5 100% 77.5% / 0.10), hsl(51.9 100% 56.3% / 0.04) 45%, transparent 72%)';

export default function SiteGlow() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 dark:hidden"
        style={{ backgroundImage: GLOW_LIGHT }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 hidden dark:block"
        style={{ backgroundImage: GLOW_DARK }}
      />
    </>
  );
}
