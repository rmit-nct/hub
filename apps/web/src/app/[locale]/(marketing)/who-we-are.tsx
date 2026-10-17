'use client';

import { Code, Users } from '@ncthub/ui/icons';
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

// Reusable section eyebrow: short line + — LABEL (standard for every section).
function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="h-px w-8 bg-brand-light-blue" />
      <span className="font-semibold text-brand-light-blue text-sm uppercase tracking-[0.25em]">
        {label}
      </span>
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
  // Light theme → bright white box; dark theme → subtle dark box.
  const boxClass = isDark
    ? 'border-white/15 bg-white/5 ring-1 ring-brand-light-blue/30 shadow-2xl'
    : 'border-brand-light-blue/20 bg-white ring-2 ring-brand-light-yellow/60 shadow-[0_12px_50px_-12px_rgba(0,0,0,0.55)]';
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
    <section className="container mx-auto p-6 sm:px-8">
      <div className="rounded-[2rem] bg-brand-dark-blue px-6 py-10 text-white sm:px-10 sm:py-20 md:rounded-[2.5rem] md:px-0 md:py-18">
        {/* Header + description — centered */}
        <motion.div {...reveal()}>
          <SectionEyebrow label="Who We Are" />
          <p className="mx-auto mt-5 max-w-5xl text-center font-medium text-base text-white/70 leading-relaxed sm:text-lg">
            A student-run community at RMIT for anyone who loves both the{' '}
            <span className="font-semibold text-amber-400">culture</span> and
            the{' '}
            <span className="font-semibold text-brand-light-blue">
              craft of technology
            </span>
            . Since 2020 we've grown into{' '}
            <span className="font-semibold text-white">one club</span> with two
            passions — people and projects — where members learn, build, and
            belong, side by side.
          </p>
        </motion.div>

        {/* Identity — centered, flanked by the two division icons */}
        <motion.div
          {...reveal(0.06)}
          className="mt-12 flex items-center justify-center gap-4 sm:gap-8"
        >
          <Users
            aria-hidden="true"
            className="hidden h-8 w-8 flex-none text-amber-400 sm:block md:h-10 md:w-10"
          />
          <div
            className={`flex items-center gap-3 rounded-2xl border px-5 py-4 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] sm:gap-4 sm:px-6 sm:py-5 md:gap-3 ${boxClass}`}
          >
            <div className="relative h-20 w-20 flex-none sm:h-24 sm:w-24 md:h-28 md:w-28">
              <Image
                src={logoSrc}
                alt="Neo Culture Tech logo"
                fill
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
          </div>
          <Code
            aria-hidden="true"
            className="hidden h-8 w-8 flex-none text-brand-light-blue sm:block md:h-10 md:w-10"
          />
        </motion.div>

        {/* Culture | Tech — center-divider split with stacked polaroids */}
        <div className="mt-10 grid gap-16 md:grid-cols-[1fr_1fr] md:gap-0">
          {/* Culture */}
          <motion.div {...reveal(0.1)} className="md:px-4">
            <h3 className="text-center font-black text-3xl text-amber-400">
              Culture
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-center text-white/70 leading-relaxed">
              The <span className="font-semibold text-amber-400">people</span>,{' '}
              <span className="font-semibold text-amber-400">events</span>, and
              shared moments that make NEO a{' '}
              <span className="font-semibold text-amber-400">community</span> —
              club days, socials, and the{' '}
              <span className="font-semibold text-amber-400">friendships</span>{' '}
              built along the way.
            </p>
            <div className="mt-8">
              <PolaroidStack photos={culturePhotos} />
            </div>
          </motion.div>

          {/* Tech */}
          <motion.div
            {...reveal(0.2)}
            className="md:border-white/15 md:border-l md:px-8"
          >
            <h3 className="text-center font-black text-3xl text-brand-light-blue">
              Tech
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-center text-white/70 leading-relaxed">
              <span className="font-semibold text-brand-light-blue">
                Software projects
              </span>
              ,{' '}
              <span className="font-semibold text-brand-light-blue">
                workshops
              </span>
              , and{' '}
              <span className="font-semibold text-brand-light-blue">
                engineering
              </span>{' '}
              — where members build real things, sharpen their craft, and push
              what they can make.
            </p>
            <div className="mt-8">
              <PolaroidStack photos={techPhotos} />
            </div>
          </motion.div>
        </div>

        {/* Unify (slogan placeholder — final treatment pending real slogan) */}
        <motion.div {...reveal(0.1)} className="mt-20 text-center">
          <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-brand-light-yellow to-brand-light-blue" />
          <p className="font-black text-4xl text-white tracking-tight sm:text-5xl md:text-6xl">
            Different passions.{' '}
            <span className="bg-gradient-to-r from-brand-light-blue to-brand-light-yellow bg-clip-text text-transparent">
              One NEO.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
