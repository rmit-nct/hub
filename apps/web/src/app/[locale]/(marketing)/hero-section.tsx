'use client';

import { Button } from '@ncthub/ui/button';
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
const RECRUITMENT_URL = 'https://rmitnct.site/recruitment';

// A rectangular polaroid-style photo card (white frame, no caption),
// stretches to the full width of its column.
function Polaroid({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <figure
      className={`w-full bg-white p-2.5 shadow-xl transition-transform duration-300 hover:rotate-0 ${className}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="400px"
          className="object-cover"
        />
      </div>
    </figure>
  );
}

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
          big N can spill past the panel edges. */}
      <div className="relative flex h-[85svh] flex-col justify-center overflow-visible rounded-3xl border border-border/50 bg-gradient-to-br from-brand-light-blue/15 via-background/60 to-brand-light-yellow/10 px-6 shadow-2xl backdrop-blur-xl sm:px-10 md:px-16">
        {/* Wordmark — centerpiece, ~80% width */}
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`${anton.className} mt-1 -translate-y-4 whitespace-nowrap text-center font-black text-6xl uppercase leading-[0.95] tracking-tight sm:text-8xl lg:text-[13rem]`}
        >
          <span className="relative inline-block pb-3 text-brand-dark-blue after:absolute after:inset-x-0 after:bottom-0 after:h-[10px] after:bg-brand-light-yellow dark:text-brand-white">
            Neo Culture
          </span>{' '}
          <span className="text-brand-light-blue">Tech</span>
        </motion.h1>

        {/* Row under the wordmark: tagline | N logo | status + CTAs */}
        <div className="mt-8 grid items-center gap-8 md:mt-0 md:grid-cols-[1fr_auto_1fr] md:gap-6">
          {/* Left — tagline */}
          <motion.div
            {...reveal(0.15)}
            className="flex w-full max-w-sm flex-col items-center gap-5 md:translate-y-7 md:items-end md:justify-self-end"
          >
            <Polaroid
              src="/club-day/sem-a-2026.jpg"
              alt="NCT Club Day"
              className="-rotate-3"
            />
            <p className="text-center text-base text-muted-foreground leading-relaxed md:text-right">
              Founded in 2020, the best club for{' '}
              <span className="border-brand-light-yellow border-b-2 font-semibold text-foreground">
                SSET students
              </span>{' '}
              to explore technology at RMIT University.
            </p>
          </motion.div>

          {/* Center — N logo (large focal mark that overflows the panel).
              Size knob: md:h-[..]/md:w-[..]. Bleed knob: md:-my-[..]. */}
          <motion.div
            {...reveal(0.1)}
            className="relative mx-auto h-72 w-72 flex-none sm:h-96 sm:w-96 md:-my-48 md:h-[700px] md:w-[700px] md:translate-y-44 md:scale-[1.6]"
          >
            <Image
              src={LOGO}
              alt="Neo Culture Tech logo"
              fill
              priority
              sizes="900px"
              className="object-contain [filter:drop-shadow(22px_22px_0_rgba(0,0,0,0.4))]"
            />
          </motion.div>

          {/* Right — recruitment status + CTAs */}
          <motion.div
            {...reveal(0.2)}
            className="flex w-full max-w-sm flex-col items-center gap-5 md:translate-y-7 md:items-start md:justify-self-start"
          >
            <Polaroid
              src="/media/marketing/events/netcompany-talk-show.jpg"
              alt="Neo Connect talk show"
              className="rotate-3"
            />
            <div className="flex items-center gap-2 font-semibold text-brand-light-blue text-sm">
              <span className="nct-blink inline-block h-2 w-2 rounded-full bg-green-500" />
              <span className="nct-blink">
                Recruitment now for Semester C - 2026
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              <Button size="lg" asChild>
                <Link
                  href={RECRUITMENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
