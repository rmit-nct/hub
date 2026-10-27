'use client';

import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { markIntroPlayed, shouldPlayIntro } from './intro-session';

const N_MARK_LIGHT = '/media/logos/transparent/light-logo-only-transparent.png';
const N_MARK_DARK = '/media/logos/transparent/dark-logo-only-transparent.png';
const HOLD_MS = 3000;
const REDUCED_HOLD_MS = 1000;

type Rect = { left: number; top: number; width: number; height: number };

export default function LandingIntro() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [startRect, setStartRect] = useState<Rect | null>(null);
  const [flySeal, setFlySeal] = useState({ x: 0, y: 0, scale: 1 });
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const nRef = useRef<HTMLDivElement>(null);
  const exitingRef = useRef(false);

  // Radial "bloom" mask that opens from the seal's center.
  const radius = useMotionValue(0);
  const mask = useMotionTemplate`radial-gradient(circle at ${center.x}px ${center.y}px, transparent ${radius}px, #000 ${radius}px)`;

  const reduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme?.includes('dark') ?? false;

  useEffect(() => {
    if (shouldPlayIntro()) {
      markIntroPlayed();
      setVisible(true);
    }
  }, []);

  // Once the badge has landed on the seal, open the circular bloom.
  const startBloom = useCallback(() => {
    const maxR = Math.hypot(window.innerWidth, window.innerHeight) * 1.15;
    animate(radius, maxR, {
      duration: 0.7,
      ease: 'easeInOut',
      onComplete: () => setVisible(false),
    });
  }, [radius]);

  const dismiss = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;

    if (reduceMotion) {
      setVisible(false);
      return;
    }

    const nEl = nRef.current;
    const target = document.querySelector<HTMLElement>('#hero-n-seal');
    if (nEl && target) {
      const n = nEl.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      const nCx = n.left + n.width / 2;
      const nCy = n.top + n.height / 2;
      const tCx = t.left + t.width / 2;
      const tCy = t.top + t.height / 2;
      setStartRect({
        left: n.left,
        top: n.top,
        width: n.width,
        height: n.height,
      });
      setFlySeal({
        x: tCx - nCx,
        y: tCy - nCy,
        scale: n.width ? t.width / n.width : 0.4,
      });
      setCenter({ x: tCx, y: tCy });
    }
    setExiting(true);
  }, [reduceMotion]);

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

  if (!visible) return null;

  return (
    <motion.div
      role="presentation"
      onClick={dismiss}
      className={`fixed inset-0 z-[100] flex items-center justify-center ${
        isDark ? 'bg-brand-dark-blue' : 'bg-white'
      }`}
      style={exiting ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
    >
      {/* Intro lockup: N + wordmark. Fades out on exit as the flyer takes over. */}
      <motion.div
        className="flex items-center justify-center gap-4 md:gap-6"
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <motion.div
          ref={nRef}
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
      </motion.div>

      {/* Flyer: a pixel-match of the hero seal that glides to its exact rect. */}
      {exiting && startRect && (
        <motion.div
          className="fixed z-20 overflow-hidden rounded-full bg-brand-dark-blue shadow-lg ring-4 ring-background"
          style={{
            left: startRect.left,
            top: startRect.top,
            width: startRect.width,
            height: startRect.height,
          }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 1,
            x: flySeal.x,
            y: flySeal.y,
            scale: flySeal.scale,
          }}
          transition={{
            duration: 0.85,
            ease: [0.22, 1, 0.36, 1],
            opacity: { duration: 0.3, ease: 'easeInOut' },
          }}
          onAnimationComplete={startBloom}
        >
          <div className="relative h-full w-full">
            <Image
              src={N_MARK_DARK}
              alt=""
              fill
              sizes="128px"
              className="scale-125 object-contain"
            />
          </div>
        </motion.div>
      )}

      <motion.button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          dismiss();
        }}
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className={`absolute right-6 bottom-6 text-sm underline-offset-4 transition hover:underline ${
          isDark
            ? 'text-brand-white/60 hover:text-brand-white'
            : 'text-brand-dark-blue/60 hover:text-brand-dark-blue'
        }`}
      >
        Skip
      </motion.button>
    </motion.div>
  );
}
