'use client';

import { Button } from '@ncthub/ui/button';
import { ArrowRight, Building2, Rocket, Users } from '@ncthub/ui/icons';
import { motion, useReducedMotion } from 'framer-motion';
import { Anton } from 'next/font/google';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

// Wordmark font — Anton (ultra-condensed display), a free stand-in for Agrandir Tight.
const anton = Anton({ subsets: ['latin'], weight: ['400'] });

// Hard on/off "machine" blink for the recruitment status.
const BLINK_CSS = `
@keyframes nct-blink {
  0%, 50% { opacity: 1; }
  50.01%, 100% { opacity: 0; }
}
.nct-blink { animation: nct-blink 1s steps(1, end) infinite; }
@media (prefers-reduced-motion: reduce) {
  .nct-blink { animation: none; }
}
`;

const LOGO = '/media/logos/transparent/light-logo-only-transparent.png';
const LOGO_DARK = '/media/logos/transparent/dark-logo-only-transparent.png';
const RECRUITMENT_URL = 'https://rmitnct.site/recruitment';

const heroStats = [
  {
    number: '70+',
    label: 'Active Members',
    sub: 'Passionate tech enthusiasts',
    icon: Users,
    color: 'text-cyan-400',
    gradient: 'from-cyan-400 to-blue-500',
    border: 'border-cyan-400/40',
    card: 'from-cyan-400/15 to-cyan-400/5',
  },
  {
    number: '30+',
    label: 'Student Projects',
    sub: 'Hands-on & shipped',
    icon: Rocket,
    color: 'text-violet-400',
    gradient: 'from-violet-400 to-purple-500',
    border: 'border-violet-400/40',
    card: 'from-violet-400/15 to-violet-400/5',
  },
  {
    number: '20+',
    label: 'Industry Partners',
    sub: 'Leading tech companies',
    icon: Building2,
    color: 'text-emerald-400',
    gradient: 'from-emerald-400 to-green-500',
    border: 'border-emerald-400/40',
    card: 'from-emerald-400/15 to-emerald-400/5',
  },
];

export default function HeroSection() {
  const reduceMotion = useReducedMotion();

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay },
          viewport: { once: true },
        };

  return (
    <section className="container mx-auto flex min-h-[120svh] flex-col justify-start px-6 pt-[1svh] pb-10 sm:px-8">
      <style>{BLINK_CSS}</style>

      {/* Glass panel — matches Who We Are / Departments; overflow-visible so the
          big N can spill past the panel edges. min-h so it grows on mobile. */}
      <div className="relative flex min-h-[85svh] flex-col justify-center overflow-visible rounded-3xl border border-border/50 bg-linear-to-br from-brand-light-blue/15 via-background/60 to-brand-light-yellow/10 px-6 py-12 shadow-2xl backdrop-blur-xl sm:px-10 md:px-16 lg:py-0">
        {/* Wordmark — centerpiece, ~80% width */}
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`${anton.className} mt-1 -translate-y-3 whitespace-nowrap text-center font-black text-5xl uppercase leading-[0.95] tracking-tight sm:text-7xl md:text-8xl lg:text-9xl xl:text-[13rem]`}
        >
          <span className="relative inline-block pb-3 text-brand-dark-blue after:absolute after:inset-x-0 after:bottom-0 after:h-2.5 after:bg-brand-light-yellow dark:text-brand-white">
            Neo Culture
          </span>{' '}
          <span className="text-brand-light-blue">Tech</span>
        </motion.h1>

        {/* Row under the wordmark: who-we-are | N logo | join + stats */}
        <div className="mt-10 grid items-center gap-10 lg:mt-0 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
          {/* Left — identity block */}
          <motion.div
            {...reveal(0.15)}
            className="mx-auto w-full max-w-xs lg:mx-0 lg:translate-y-2 lg:justify-self-end"
          >
            <div className="group relative w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
              {/* Photo */}
              <div className="relative aspect-4/3 w-full overflow-hidden">
                <Image
                  src="/club-day/sem-a-2026.jpg"
                  alt="NCT Club Day"
                  fill
                  sizes="(max-width: 767px) 90vw, 360px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Brand footer band */}
              <div className="relative bg-linear-to-br from-brand-dark-blue to-brand-light-blue p-5 text-white">
                {/* floating NCT seal straddling the seam — spins on hover */}
                <div
                  id="hero-n-seal"
                  className="absolute -top-6 right-5 h-14 w-14 overflow-hidden rounded-full bg-brand-dark-blue shadow-lg ring-4 ring-background transition-transform duration-700 ease-out group-hover:rotate-[360deg]"
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={LOGO_DARK}
                      alt="Neo Culture Tech logo"
                      fill
                      sizes="56px"
                      className="scale-150 object-contain"
                    />
                  </div>
                </div>

                <span className="font-semibold text-brand-light-yellow text-xs uppercase tracking-[0.25em]">
                  Est. 2020
                </span>
                <p className="mt-1 font-black text-2xl leading-[1.1] sm:text-3xl">
                  Best club for{' '}
                  <span className="whitespace-nowrap border-brand-light-yellow border-b-4">
                    SSET
                  </span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Center — N logo (large focal mark that overflows the panel).
              Size knob: md:h-[..]/md:w-[..]. Bleed knob: md:-my-[..]. */}
          <motion.div
            {...reveal(0.1)}
            className="relative mx-auto h-72 w-72 flex-none sm:h-96 sm:w-96 md:h-112 md:w-112 lg:-my-48 lg:h-175 lg:w-175 lg:translate-y-36 lg:scale-[1.6]"
          >
            <Image
              src={LOGO}
              alt="Neo Culture Tech logo"
              fill
              priority
              sizes="900px"
              className="filter-[drop-shadow(22px_22px_0_rgba(0,0,0,0.4))] object-contain"
            />
          </motion.div>

          {/* Right — recruitment + Join Now + stats */}
          <motion.div
            {...reveal(0.2)}
            className="mx-auto flex w-full max-w-sm flex-col items-center gap-5 lg:mx-0 lg:translate-y-2 lg:items-start lg:text-left"
          >
            <p className="text-center text-base text-muted-foreground lg:text-left">
              Join a tech community to connect, create, and grow together.
            </p>

            <div className="flex items-center gap-2 font-semibold text-brand-light-blue text-sm">
              <span className="nct-blink inline-block h-2 w-2 rounded-full bg-green-500" />
              <span className="nct-blink">
                Recruitment now for Semester C - 2026
              </span>
            </div>

            <div className="flex flex-nowrap items-center justify-center gap-2 lg:justify-start">
              <Button
                size="lg"
                asChild
                className="h-11 whitespace-nowrap bg-brand-dark-blue px-5 font-semibold text-sm text-white hover:bg-brand-dark-blue/90 dark:bg-white dark:text-brand-dark-blue dark:hover:bg-white/90"
              >
                <Link
                  href={RECRUITMENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Now
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-11 whitespace-nowrap border-brand-dark-blue/30 px-5 font-semibold text-brand-dark-blue text-sm hover:bg-brand-dark-blue hover:text-white dark:border-white/40 dark:text-white dark:hover:bg-white dark:hover:text-brand-dark-blue"
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>

            <div className="grid w-full grid-cols-3 gap-2 sm:gap-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className={`flex flex-col items-center rounded-xl border bg-linear-to-br p-3 text-center shadow-sm ${stat.border} ${stat.card}`}
                >
                  <stat.icon
                    aria-hidden="true"
                    className={`mb-1 h-5 w-5 ${stat.color}`}
                  />
                  <div
                    className={`bg-linear-to-r bg-clip-text font-black text-2xl text-transparent sm:text-3xl ${stat.gradient}`}
                  >
                    {stat.number}
                  </div>
                  <div className="font-semibold text-foreground text-xs leading-tight">
                    {stat.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-tight">
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
