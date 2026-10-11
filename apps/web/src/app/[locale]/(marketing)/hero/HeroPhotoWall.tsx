'use client';

import { Button } from '@ncthub/ui/button';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { type HeroPhoto, heroPhotos } from './photos';

const RECRUITMENT_URL = 'https://rmitnct.site/recruitment';
const LOGO_SRC = '/media/logos/transparent/light-logo-only-transparent.png';

const MARQUEE_CSS = `
@keyframes nct-marquee-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes nct-marquee-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}
.nct-marquee-track {
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
.nct-marquee:hover .nct-marquee-track {
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .nct-marquee-track { animation: none; }
}
`;

function MarqueeRow({
  photos,
  direction,
  durationSeconds,
  eager = false,
}: {
  photos: HeroPhoto[];
  direction: 'left' | 'right';
  durationSeconds: number;
  eager?: boolean;
}) {
  const tiles = [...photos, ...photos];
  return (
    <div className="nct-marquee w-full overflow-hidden">
      <div
        className="nct-marquee-track flex w-max"
        style={{
          animationName:
            direction === 'left' ? 'nct-marquee-left' : 'nct-marquee-right',
          animationDuration: `${durationSeconds}s`,
        }}
      >
        {tiles.map((photo, i) => (
          <div
            key={`${photo.src}-${i}`}
            className="relative mr-4 h-40 w-64 shrink-0 overflow-hidden rounded-xl shadow-md md:h-52 md:w-80"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              priority={eager && i < 3}
              sizes="(max-width: 768px) 256px, 320px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HeroPhotoWall() {
  return (
    <section
      aria-label="Club highlights"
      className="flex min-h-[calc(100svh-4rem)] w-full flex-col justify-center gap-10 overflow-hidden py-12"
    >
      <style>{MARQUEE_CSS}</style>

      {/* Text block */}
      <div className="container mx-auto flex flex-col items-center gap-5 px-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-light-blue/40 bg-brand-light-blue/10 px-4 py-1.5 font-semibold text-brand-light-blue text-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          Gen 8 · Recruiting Now
        </span>

        {/* Logo + club name lockup */}
        <div className="flex items-center justify-center gap-3 md:gap-4">
          <div className="relative h-14 w-14 shrink-0 md:h-20 md:w-20">
            <Image
              src={LOGO_SRC}
              alt="Neo Culture Tech logo"
              fill
              priority
              sizes="80px"
              className="object-contain"
            />
          </div>
          <h1 className="flex items-baseline gap-2 font-black text-3xl md:text-5xl">
            <span className="relative text-foreground">
              NEO CULTURE
              <span className="absolute -bottom-1.5 left-0 h-1 w-full rounded-full bg-brand-light-yellow md:h-1.5" />
            </span>
            <span className="text-brand-light-blue">TECH</span>
          </h1>
        </div>

        <p className="max-w-xl text-base text-muted-foreground md:text-lg">
          The tech community for SSET students at RMIT
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link
              href={RECRUITMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Us
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/about">Learn more</Link>
          </Button>
        </div>
      </div>

      {/* Photo wall */}
      <div className="flex flex-col gap-4">
        <MarqueeRow
          photos={heroPhotos}
          direction="left"
          durationSeconds={40}
          eager
        />
        <MarqueeRow
          photos={[...heroPhotos].reverse()}
          direction="right"
          durationSeconds={48}
        />
      </div>
    </section>
  );
}
