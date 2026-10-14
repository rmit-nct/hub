'use client';

import { Button } from '@ncthub/ui/button';
import { ArrowRight, Lightbulb, Trophy, Users } from '@ncthub/ui/icons';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';

// Placeholder copy — edit freely.
const values = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'We turn bold ideas into real projects, experimenting with new tech without the fear of failing.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description:
      'We grow together — sharing skills across teams and backing each other on every build.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Trophy,
    title: 'Excellence',
    description:
      'We hold a high bar, from clean code to polished events, and take pride in doing things well.',
    gradient: 'from-violet-500 to-purple-500',
  },
];

const stats = [
  { number: '2020', label: 'Founded' },
  { number: '8', label: 'Generations' },
  { number: '3', label: 'Core Teams' },
];

// Placeholder milestones — edit years/titles and swap photos freely.
const milestones = [
  {
    year: '2020',
    title: 'Founded',
    src: '/media/marketing/landing-page.jpg',
    alt: 'The beginnings of Neo Culture Tech',
  },
  {
    year: '2024',
    title: 'Website display',
    src: '/club-day/sem-b-2024.jpg',
    alt: 'NCT Club Day',
  },
  {
    year: '2025',
    title: 'Award',
    src: '/media/marketing/events/netcompany-tour.jpg',
    alt: 'Netcompany company tour',
  },
  {
    year: '2026',
    title: 'Today',
    src: '/club-day/sem-a-2026.jpg',
    alt: 'NCT Club Day 2026',
  },
];

export default function WhatWeDo() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme?.includes('dark');
  const logoSrc = isDark
    ? '/media/logos/transparent/dark-logo-only-transparent.png'
    : '/media/logos/transparent/light-logo-only-transparent.png';

  return (
    <motion.section
      className="w-full py-16 sm:py-20"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-8">
        {/* Heading */}
        <p className="text-center font-semibold text-base text-brand-light-blue uppercase tracking-[0.25em]">
          What we do
        </p>

        {/* Big logo + club name */}
        <div className="mt-6 flex items-center justify-center gap-3 sm:gap-4 md:gap-6">
          <div className="relative h-16 w-16 flex-none sm:h-20 sm:w-20 md:h-28 md:w-28">
            <Image
              src={logoSrc}
              alt="Neo Culture Tech logo"
              fill
              sizes="112px"
              className="object-contain"
            />
          </div>
          <div className="whitespace-nowrap text-left font-black text-2xl leading-none tracking-tight sm:text-3xl md:text-5xl">
            <span className="text-brand-dark-blue underline decoration-4 decoration-brand-light-yellow underline-offset-8 dark:text-brand-white">
              NEO CULTURE
            </span>{' '}
            <span className="text-brand-light-blue">TECH</span>
          </div>
        </div>

        {/* Short description (placeholder) */}
        <p className="mx-auto mt-6 max-w-2xl text-center font-medium text-base text-muted-foreground leading-relaxed sm:text-lg">
          Neo Culture Tech is a student-run tech community at RMIT where SSET
          students learn by building — hands-on projects, events, and training
          that turn curiosity into real skills and lasting friendships.
        </p>

        {/* Core values — gradient cards with per-value colored icons */}
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-brand-light-blue/10 via-background to-brand-light-yellow/10 p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-light-blue/15 to-brand-light-yellow/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow ${value.gradient}`}
                >
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-bold text-foreground text-xl">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Current status — stats + photo timeline */}
        <div className="mt-20">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-6">
                {i > 0 && (
                  <span className="hidden h-10 w-px bg-border sm:block" />
                )}
                <div className="text-center">
                  <div className="font-black text-3xl text-brand-light-blue">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground text-sm uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Photo timeline: 2020 → now */}
          <div className="mt-12 sm:px-8">
            {/* Photos (year + title shown under each on mobile) */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  viewport={{ once: true }}
                  className="flex flex-col"
                >
                  <div className="group relative aspect-4/3 w-full overflow-hidden rounded-xl shadow-md">
                    <Image
                      src={m.src}
                      alt={m.alt}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  {/* Mobile: year + title under the photo */}
                  <div className="mt-5 text-center md:hidden">
                    <div className="font-black text-brand-light-blue text-lg">
                      {m.year}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {m.title}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Timeline bar — connected dots + years (desktop) */}
            <div className="relative mt-8 hidden md:block">
              {/* connecting line (desktop) */}
              <div className="absolute top-[7px] right-[12.5%] left-[12.5%] hidden h-0.5 bg-gradient-to-r from-brand-light-blue via-brand-light-yellow to-brand-light-blue md:block" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
                {milestones.map((m) => (
                  <div
                    key={m.year}
                    className="relative flex flex-col items-center text-center"
                  >
                    <span className="h-3.5 w-3.5 rounded-full bg-brand-light-blue ring-4 ring-background" />
                    <div className="mt-2 font-black text-brand-light-blue text-xl">
                      {m.year}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {m.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Our journey — prominent CTA */}
        <div className="mt-14 flex justify-center">
          <Button size="lg" asChild>
            <Link
              href="/about"
              className="group inline-flex items-center gap-2"
            >
              Our journey
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
