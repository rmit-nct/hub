'use client';

import { Badge } from '@ncthub/ui/badge';
import { Building2, Code, Rocket, Sparkles, Users } from '@ncthub/ui/icons';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface Photo {
  src: string;
  alt: string;
  caption: string;
}

// Placeholder photos — swap to /media/marketing/landing-page/about/* later.
const culturePhotos: Photo[] = [
  { src: '/club-day/sem-a-2026.jpg', alt: 'NCT Club Day', caption: 'Club Day' },
  {
    src: '/media/marketing/events/netcompany-talk-show.jpg',
    alt: 'Neo Connect talk show',
    caption: 'Neo Connect',
  },
];

const techPhotos: Photo[] = [
  {
    src: '/media/marketing/workshops/cv-workshop.jpg',
    alt: 'CV workshop',
    caption: 'CV Workshop',
  },
  {
    src: '/media/marketing/neo-league/neo-league-2025.png',
    alt: 'NEO League',
    caption: 'NEO League',
  },
];

// Logo variants: bright full-color for the light box, neon for the dark box.
const LOGO_LIGHT = '/media/logos/transparent/light-logo-only-transparent.png';
const LOGO_DARK = '/media/logos/transparent/dark-logo-only-transparent.png';

// Quick stats shown beside the slogan — each with its own gradient + icon.
const aboutStats = [
  {
    number: '70+',
    label: 'Active Members',
    gradient: 'from-cyan-400 to-blue-500',
    icon: Users,
    iconColor: 'text-cyan-400',
  },
  {
    number: '30+',
    label: 'Student Projects',
    gradient: 'from-violet-400 to-purple-500',
    icon: Rocket,
    iconColor: 'text-violet-400',
  },
  {
    number: '20+',
    label: 'Industry Partners',
    gradient: 'from-emerald-400 to-green-500',
    icon: Building2,
    iconColor: 'text-emerald-400',
  },
];

function PolaroidCard({
  photo,
  className = '',
}: {
  photo: Photo;
  className?: string;
}) {
  return (
    <figure
      className={`relative cursor-pointer bg-white p-3 shadow-2xl transition-transform duration-300 hover:z-20 hover:rotate-0 hover:scale-105 ${className}`}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="400px"
          className="object-cover"
        />
      </div>
    </figure>
  );
}

// Two big rectangular polaroids filling the column, overlapping only slightly:
// one up-left, the second down-right over its corner.
function PolaroidStack({ photos }: { photos: Photo[] }) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col">
      <PolaroidCard
        photo={photos[0] as Photo}
        className="w-[72%] -rotate-2 self-start"
      />
      <PolaroidCard
        photo={photos[1] as Photo}
        className="relative z-13 -mt-16 w-[72%] translate-x-2 rotate-2 self-end sm:-mt-16"
      />
    </div>
  );
}

// Auto-scrolling "wall of moments" strip under the two divisions.
const stripPhotos: { src: string; alt: string; caption: string }[] = [
  { src: '/club-day/sem-a-2026.jpg', alt: 'NCT Club Day', caption: 'Club Day' },
  {
    src: '/media/marketing/events/netcompany-tour.jpg',
    alt: 'Company tour',
    caption: 'Company Tour',
  },
  {
    src: '/media/marketing/neo-league/neo-league-2025.png',
    alt: 'NEO League',
    caption: 'NEO League',
  },
  {
    src: '/media/marketing/workshops/cv-workshop.jpg',
    alt: 'CV workshop',
    caption: 'CV Workshop',
  },
  { src: '/club-day/sem-b-2024.jpg', alt: 'NCT Club Day', caption: 'Club Day' },
  {
    src: '/media/marketing/events/netcompany-talk-show.jpg',
    alt: 'Neo Connect',
    caption: 'Neo Connect',
  },
  { src: '/club-day/sem-c-2025.png', alt: 'NCT Club Day', caption: 'Club Day' },
  {
    src: '/media/marketing/neo-league/neo-league-2026.png',
    alt: 'NEO League',
    caption: 'NEO League',
  },
];

const MARQUEE_CSS = `
@keyframes nct-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.nct-marquee-track { animation: nct-marquee 45s linear infinite; }
.nct-marquee-track-rev { animation: nct-marquee 45s linear infinite reverse; }
.nct-marquee:hover .nct-marquee-track,
.nct-marquee:hover .nct-marquee-track-rev { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .nct-marquee-track, .nct-marquee-track-rev { animation: none; }
}
`;

function MarqueeRow({
  photos,
  reverse = false,
}: {
  photos: typeof stripPhotos;
  reverse?: boolean;
}) {
  const tiles = [...photos, ...photos];
  return (
    <div className="nct-marquee w-full overflow-hidden [-webkit-mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        className={`flex w-max ${reverse ? 'nct-marquee-track-rev' : 'nct-marquee-track'}`}
      >
        {tiles.map((photo, i) => (
          <div
            key={`${photo.src}-${i}`}
            className="group relative mr-4 h-28 w-44 shrink-0 overflow-hidden rounded-xl shadow-md sm:h-36 sm:w-56"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="240px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* hover caption */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="pointer-events-none absolute bottom-2 left-3 font-semibold text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {photo.caption}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotoStrip() {
  return (
    <div className="mt-6 flex flex-col gap-3">
      <style>{MARQUEE_CSS}</style>
      <MarqueeRow photos={stripPhotos} />
      <MarqueeRow photos={[...stripPhotos].reverse()} reverse />
    </div>
  );
}

export default function WhoWeAre() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme?.includes('dark');
  const logoSrc = isDark ? LOGO_DARK : LOGO_LIGHT;
  const neoClass = isDark ? 'text-brand-white' : 'text-brand-dark-blue';

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay },
          viewport: { once: true },
        };

  return (
    <section className="container mx-auto mt-12 p-6 sm:px-8">
      {/* Header + subheadline (above the panel, on the page background) */}
      <div className="mb-8 text-center">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-4 inline-flex items-center gap-2"
        >
          <Sparkles className="h-6 w-6 text-brand-light-yellow" />
          <Badge
            variant="outline"
            className="border-brand-light-blue/50 px-4 py-2 text-base text-brand-light-blue"
          >
            About the Club
          </Badge>
          <Sparkles className="h-6 w-6 text-brand-light-yellow" />
        </motion.div>

        <h2 className="mb-3 pb-2 font-bold text-3xl md:text-6xl lg:text-7xl">
          Who{' '}
          <span className="whitespace-nowrap border-brand-light-yellow border-b-4 text-brand-light-blue">
            We Are
          </span>
        </h2>

        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          A tech community to connect, create, and grow together
        </p>
      </div>

      {/* Panel (matches the Memorable Moments card bg) — logo brand + split */}
      <div className="rounded-3xl border border-border/50 bg-background/60 px-6 py-10 shadow-2xl backdrop-blur-xl sm:px-10 sm:py-12 md:p-8">
        {/* Identity — centered, flanked by the two division icons */}
        <motion.div
          {...reveal(0.06)}
          className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6"
        >
          <div className="relative h-20 w-20 flex-none sm:h-24 sm:w-24 md:h-28 md:w-28">
            <Image
              src={logoSrc}
              alt="Neo Culture Tech logo"
              fill
              priority
              sizes="112px"
              className="object-contain"
            />
          </div>
          <div className="whitespace-nowrap text-left font-black text-2xl leading-none tracking-tight sm:text-3xl md:text-5xl">
            <span
              className={`underline decoration-4 decoration-brand-light-yellow underline-offset-8 ${neoClass}`}
            >
              NEO CULTURE
            </span>{' '}
            <span className="text-brand-light-blue">TECH</span>
          </div>
        </motion.div>

        {/* Culture | Tech — center-divider split with stacked polaroids */}
        <div className="mt-8 grid gap-10 md:grid-cols-[1fr_1fr] md:gap-0">
          {/* Culture */}
          <motion.div {...reveal(0.1)} className="md:px-4">
            <h3 className="flex items-center justify-center gap-2 font-black text-2xl text-amber-400">
              <Users aria-hidden="true" className="h-6 w-6" />
              Culture
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground leading-relaxed">
              We create opportunities for students to{' '}
              <span className="font-semibold text-amber-400">connect</span>,
              exchange perspectives, and{' '}
              <span className="font-semibold text-amber-400">
                grow together
              </span>
              . Through events and shared experiences, Culture builds the{' '}
              <span className="font-semibold text-amber-400">
                relationships
              </span>{' '}
              that make our{' '}
              <span className="font-semibold text-amber-400">community</span>{' '}
              stronger.
            </p>
            <div className="mt-6">
              <PolaroidStack photos={culturePhotos} />
            </div>
          </motion.div>

          {/* Tech */}
          <motion.div
            {...reveal(0.2)}
            className="md:border-border md:border-l md:px-8"
          >
            <h3 className="flex items-center justify-center gap-2 font-black text-2xl text-brand-light-blue">
              <Code aria-hidden="true" className="h-6 w-6" />
              Tech
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground leading-relaxed">
              We turn curiosity into capability through{' '}
              <span className="font-semibold text-brand-light-blue">
                collaborative projects
              </span>
              ,{' '}
              <span className="font-semibold text-brand-light-blue">
                practical workshops
              </span>
              , and hands-on experimentation. Tech is where members challenge
              themselves, develop their{' '}
              <span className="font-semibold text-brand-light-blue">craft</span>
              , and create{' '}
              <span className="font-semibold text-brand-light-blue">
                meaningful solutions
              </span>
              .
            </p>
            <div className="mt-6">
              <PolaroidStack photos={techPhotos} />
            </div>
          </motion.div>
        </div>

        {/* Slogan + stats row, above the photo strip */}
        <motion.div
          {...reveal(0.1)}
          className="mt-10 flex flex-col items-center justify-between gap-8 md:flex-row md:items-end"
        >
          {/* Slogan — staggered, two weights */}
          <div className="w-fit">
            <span className="mb-3 block font-semibold text-brand-light-blue text-sm uppercase tracking-[0.25em]">
              Our Moments
            </span>
            <span className="block font-medium text-3xl text-foreground/80 uppercase leading-none tracking-tight sm:text-4xl">
              Stronger
            </span>
            <span className="filter-[drop-shadow(0_0_18px_rgba(34,211,238,0.45))] mt-1 block translate-x-8 bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text font-bold text-4xl text-transparent uppercase leading-none tracking-tight sm:translate-x-16 sm:text-6xl">
              Together
            </span>
          </div>

          {/* Stats cluster */}
          <div className="flex gap-8 sm:gap-12">
            {aboutStats.map((stat) => (
              <div key={stat.label} className="text-center md:text-right">
                <div className="flex items-center justify-center gap-2 md:justify-end">
                  <stat.icon
                    aria-hidden="true"
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.iconColor}`}
                  />
                  <div
                    className={`bg-linear-to-r bg-clip-text font-black text-3xl text-transparent sm:text-4xl ${stat.gradient}`}
                  >
                    {stat.number}
                  </div>
                </div>
                <div className="mt-1 text-muted-foreground text-xs uppercase tracking-wide sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Auto-scrolling wall of moments */}
        <PhotoStrip />
      </div>
    </section>
  );
}
