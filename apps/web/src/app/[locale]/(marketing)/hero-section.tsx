'use client';

import { Button } from '@ncthub/ui/button';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

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
      <div className="relative flex h-[85svh] flex-col justify-center overflow-visible rounded-3xl border border-border/50 bg-background/60 px-6 shadow-2xl backdrop-blur-xl sm:px-10 md:px-16">
        {/* Wordmark — centerpiece, ~80% width */}
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-16 text-center font-black text-6xl uppercase leading-[0.95] tracking-tight sm:text-8xl lg:text-[9rem]"
        >
          <span className="inline-block border-brand-light-yellow border-b-4 pb-3 text-brand-dark-blue dark:text-brand-white">
            Neo Culture
          </span>
          <span className="mt-6 block text-brand-light-blue">Tech</span>
        </motion.h1>

        {/* Row under the wordmark: tagline | N logo | status + CTAs */}
        <div className="mt-8 grid items-center gap-8 md:mt-6 md:grid-cols-[1fr_auto_1fr] md:gap-6">
          {/* Left — tagline */}
          <motion.p
            {...reveal(0.15)}
            className="max-w-sm text-center text-base text-muted-foreground leading-relaxed md:justify-self-end md:text-right"
          >
            Founded in 2020, the best club for{' '}
            <span className="border-brand-light-yellow border-b-2 font-semibold text-foreground">
              SSET students
            </span>{' '}
            to explore technology at RMIT University.
          </motion.p>

          {/* Center — N logo (large focal mark that overflows the panel).
              Size knob: md:h-[..]/md:w-[..]. Bleed knob: md:-my-[..]. */}
          <motion.div
            {...reveal(0.1)}
            className="relative mx-auto h-72 w-72 flex-none sm:h-96 sm:w-96 md:-my-48 md:h-[700px] md:w-[700px] md:translate-y-24 md:scale-[1.45]"
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
            className="flex flex-col items-center gap-4 md:items-start"
          >
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
