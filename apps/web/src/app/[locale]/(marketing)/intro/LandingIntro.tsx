'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
import { markIntroPlayed, shouldPlayIntro } from './intro-session';

const N_MARK_LIGHT = '/media/logos/transparent/light-logo-only-transparent.png';
const N_MARK_DARK = '/media/logos/transparent/dark-logo-only-transparent.png';
const HOLD_MS = 3000;
const REDUCED_HOLD_MS = 1000;

export default function LandingIntro() {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme?.includes('dark') ?? false;

  // Decide on the client only, to avoid SSR/hydration mismatch.
  useEffect(() => {
    if (shouldPlayIntro()) {
      markIntroPlayed();
      setVisible(true);
    }
  }, []);

  const dismiss = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (!visible) return;

    const hold = reduceMotion ? REDUCED_HOLD_MS : HOLD_MS;
    const timer = window.setTimeout(dismiss, hold);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [visible, reduceMotion, dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="presentation"
          onClick={dismiss}
          className={`fixed inset-0 z-[100] flex items-center justify-center ${
            isDark ? 'bg-brand-dark-blue' : 'bg-white'
          }`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Horizontal lockup: N on the left, wordmark revealed to its right. */}
          <div className="flex items-center justify-center gap-4 md:gap-6">
            {/* N mark: fades in large, holds, then shrinks (stays centered). */}
            <motion.div
              className="relative h-24 w-24 shrink-0 md:h-32 md:w-32"
              initial={reduceMotion ? false : { opacity: 0, scale: 1.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                opacity: { duration: 0.5, ease: 'easeOut' },
                scale: { duration: 0.7, delay: 1, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              <Image
                src={isDark ? N_MARK_DARK : N_MARK_LIGHT}
                alt="Neo Culture Tech logo"
                fill
                priority
                sizes="128px"
                className="object-contain"
              />
            </motion.div>

            {/* Wordmark: width expands from the logo's right edge (mask-wipe). */}
            <motion.div
              className="overflow-hidden"
              initial={reduceMotion ? false : { width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              transition={{
                width: {
                  duration: 0.8,
                  ease: 'easeInOut',
                  delay: reduceMotion ? 0 : 1.7,
                },
                opacity: { duration: 0.3, delay: reduceMotion ? 0 : 1.7 },
              }}
            >
              <div className="flex items-baseline gap-2.5 whitespace-nowrap pb-3 md:gap-3">
                <span
                  className={`relative font-black text-3xl uppercase leading-none tracking-wide md:text-5xl ${
                    isDark ? 'text-brand-white' : 'text-brand-dark-blue'
                  }`}
                >
                  NEO CULTURE
                  <span className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-brand-light-yellow md:h-1.5" />
                </span>
                <span className="font-black text-3xl text-brand-light-blue uppercase leading-none tracking-wide md:text-5xl">
                  TECH
                </span>
              </div>
            </motion.div>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              dismiss();
            }}
            className={`absolute right-6 bottom-6 text-sm underline-offset-4 transition hover:underline ${
              isDark
                ? 'text-brand-white/60 hover:text-brand-white'
                : 'text-brand-dark-blue/60 hover:text-brand-dark-blue'
            }`}
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
