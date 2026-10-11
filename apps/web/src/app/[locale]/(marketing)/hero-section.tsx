'use client';

import { Button } from '@ncthub/ui/button';
import { Building2, Code, Users } from '@ncthub/ui/icons';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';

interface SlotImage {
  src: string;
  alt: string;
  caption: string;
}

// Each collage slot slowly crossfades through its own set of photos.
// NOTE: photo paths are placeholders using existing images — swap to
// /media/marketing/landing-page/hero/* once those files are added.
const slotLarge: SlotImage[] = [
  {
    src: '/club-day/sem-a-2026.jpg',
    alt: 'NCT Club Day 2026',
    caption: 'Club Day',
  },
  {
    src: '/media/marketing/events/netcompany-talk-show.jpg',
    alt: 'Neo Connect x Netcompany',
    caption: 'Neo Connect',
  },
  {
    src: '/media/marketing/neo-league/neo-league-2025.png',
    alt: 'NEO League',
    caption: 'NEO League',
  },
];

const slotSmallA: SlotImage[] = [
  {
    src: '/media/marketing/events/netcompany-tour.jpg',
    alt: 'Netcompany company tour',
    caption: 'Company Tour',
  },
  {
    src: '/media/marketing/neo-league/neo-league-2026.png',
    alt: 'NEO League',
    caption: 'NEO League',
  },
];

const slotSmallB: SlotImage[] = [
  {
    src: '/media/marketing/workshops/cv-workshop.jpg',
    alt: 'CV workshop',
    caption: 'CV Workshop',
  },
  {
    src: '/club-day/sem-c-2025.png',
    alt: 'NCT Club Day 2025',
    caption: 'Club Day',
  },
  {
    src: '/club-day/sem-b-2024.jpg',
    alt: 'NCT Club Day 2024',
    caption: 'Club Day',
  },
];

function RotatingImage({
  images,
  sizes,
  intervalMs,
  priority = false,
}: {
  images: SlotImage[];
  sizes: string;
  intervalMs: number;
  priority?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || images.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [reduceMotion, images.length, intervalMs]);

  return (
    <>
      {images.map((image, i) => (
        <motion.div
          key={image.src}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={priority && i === 0}
            sizes={sizes}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Hover caption for this photo */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 translate-y-full p-4 transition-transform duration-300 group-hover:translate-y-0">
            <span className="font-bold text-sm text-white">
              {image.caption}
            </span>
          </div>
        </motion.div>
      ))}
    </>
  );
}

const stats = [
  {
    number: '70+',
    content: 'Active Members',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Passionate tech enthusiasts',
  },
  {
    number: '30+',
    content: 'Student Projects',
    icon: Code,
    gradient: 'from-purple-500 to-pink-500',
    description: 'Innovation driven solutions',
  },
  {
    number: '20+',
    content: 'Industry Partners',
    icon: Building2,
    gradient: 'from-green-500 to-emerald-500',
    description: 'Leading tech companies',
  },
];

// Hard on/off "machine" blink for the recruitment status text.
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

export default function HeroSection() {
  return (
    <motion.section
      className="my-4 md:my-16"
      initial={{ opacity: 0, y: 50 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <style>{BLINK_CSS}</style>
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {/* Logo */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative h-14 w-14 flex-none overflow-hidden rounded-xl border-2 border-brand-light-blue/20 bg-brand-light-blue/10 p-2 shadow-lg backdrop-blur-sm">
              <Image
                src="/media/logos/transparent.png"
                alt="NCT Logo"
                fill
                sizes="56px"
                className="object-contain p-1"
              />
            </div>
          </div>

          {/* Decorative Title */}
          <div className="mb-4">
            <p className="mb-2 font-semibold text-brand-light-blue text-sm uppercase tracking-[0.25em]">
              Who We Are
            </p>
            <h1 className="font-black text-4xl leading-tight tracking-normal md:text-5xl">
              <span className="text-brand-dark-blue underline decoration-4 decoration-brand-light-yellow underline-offset-8 dark:text-brand-white">
                NEO CULTURE
              </span>
              <br />
              <span className="text-brand-light-blue">TECH</span>
            </h1>
          </div>

          {/* Description */}
          <p className="mb-8 font-medium text-foreground text-lg leading-relaxed md:max-w-lg">
            Founded in 2020, we are the best club for{' '}
            <span className="border-brand-light-yellow border-b-2 text-brand-light-blue">
              SSET students
            </span>{' '}
            to explore the world of technology at RMIT University.
          </p>

          {/* Recruitment status */}
          <div className="mb-3 flex items-center gap-2 font-semibold text-brand-light-blue text-sm">
            <span className="nct-blink inline-block h-2 w-2 rounded-full bg-green-500" />
            <span className="nct-blink">
              Recruitment now for Semester C - 2026
            </span>
          </div>

          {/* Buttons */}
          <div className="mb-12 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link
                href="https://rmitnct.site/recruitment"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Us
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.15 }}
                viewport={{ once: true }}
                className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border border-border/50 bg-background/50 px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:border-primary/30"
              >
                {/* Background gradient effect */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${item.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                />

                {/* Icon */}
                <div
                  className={`h-10 w-10 flex-none rounded-full bg-linear-to-r ${item.gradient} p-0.5`}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
                    <item.icon className="h-5 w-5 text-foreground" />
                  </div>
                </div>

                {/* Number + label */}
                <h3
                  className={`bg-linear-to-r font-extrabold text-3xl ${item.gradient} bg-clip-text text-transparent`}
                >
                  {item.number}
                </h3>
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="truncate font-semibold text-sm">
                    {item.content}
                  </span>
                  <p className="text-muted-foreground text-xs">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Column — 3 Images with glow */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Rounded glow behind images */}
          <div className="-translate-1/2 absolute inset-1/2 -z-10 aspect-square h-full rounded-full bg-brand-light-blue/20 blur-2xl" />

          {/* Large top image */}
          <div className="group relative aspect-4/3 overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
            <RotatingImage
              images={slotLarge}
              sizes="(max-width: 1023px) 100vw, 50vw"
              intervalMs={5000}
              priority
            />
          </div>

          {/* Two sub-images, staggered */}
          <div className="mt-4 grid grid-cols-2 gap-4 pt-10">
            <div className="group relative aspect-3/2 -translate-y-8 overflow-hidden rounded-xl shadow-xl transition-all duration-500 hover:-translate-y-10 hover:shadow-2xl">
              <RotatingImage
                images={slotSmallA}
                sizes="(max-width: 1023px) 50vw, 25vw"
                intervalMs={6000}
              />
            </div>
            <div className="group relative aspect-3/2 translate-y-2 overflow-hidden rounded-xl shadow-xl transition-all duration-500 hover:translate-y-0 hover:shadow-2xl">
              <RotatingImage
                images={slotSmallB}
                sizes="(max-width: 1023px) 50vw, 25vw"
                intervalMs={5500}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
