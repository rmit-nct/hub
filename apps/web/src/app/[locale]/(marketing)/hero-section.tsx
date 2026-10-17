'use client';

import { Button } from '@ncthub/ui/button';
import { cn } from '@ncthub/utils/format';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';

interface SlotImage {
  src: string;
  alt: string;
  caption: string;
}

// Three gallery tiles, each crossfading through its own set of photos.
// NOTE: photo paths are placeholders using existing images — swap to
// /media/marketing/landing-page/hero/* once those files are added.
const slot1: SlotImage[] = [
  {
    src: '/club-day/sem-a-2026.jpg',
    alt: 'NCT Club Day 2026',
    caption: 'Club Day',
  },
  {
    src: '/media/marketing/neo-league/neo-league-2025.png',
    alt: 'NEO League',
    caption: 'NEO League',
  },
  {
    src: '/media/marketing/events/netcompany-talk-show.jpg',
    alt: 'Neo Connect x Netcompany',
    caption: 'Neo Connect',
  },
];

const slot2: SlotImage[] = [
  {
    src: '/media/marketing/events/netcompany-tour.jpg',
    alt: 'Netcompany company tour',
    caption: 'Company Tour',
  },
  {
    src: '/media/marketing/workshops/cv-workshop.jpg',
    alt: 'CV workshop',
    caption: 'CV Workshop',
  },
  {
    src: '/media/marketing/neo-league/neo-league-2026.png',
    alt: 'NEO League',
    caption: 'NEO League',
  },
];

const slot3: SlotImage[] = [
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

const GALLERY = [
  { id: 'a', images: slot1, intervalMs: 5000 },
  { id: 'b', images: slot2, intervalMs: 6000 },
  { id: 'c', images: slot3, intervalMs: 5500 },
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

// Click-to-expand gallery: two tiles share a row; the third spans a full row.
// Clicking a tile expands it and swaps a neighbour to the other row.
function ExpandingPhotoGrid() {
  const [layout, setLayout] = useState(() => ({
    row1: GALLERY.slice(0, 2).map((s) => s.id),
    row2: GALLERY.slice(2).map((s) => s.id),
  }));

  const handleExpand = (id: string) => {
    const inRow1 = layout.row1.includes(id);
    const inRow2 = layout.row2.includes(id);
    if (
      (inRow1 && layout.row1.length === 1) ||
      (inRow2 && layout.row2.length === 1)
    )
      return;

    if (inRow1) {
      const neighbor = layout.row1.find((i) => i !== id);
      if (!neighbor) return;
      setLayout({
        row1: [id],
        row2: [neighbor, ...layout.row2.filter((i) => i !== neighbor)].slice(
          0,
          2
        ),
      });
    } else {
      const neighbor = layout.row2.find((i) => i !== id);
      if (!neighbor) return;
      setLayout({
        row1: [neighbor, ...layout.row1.filter((i) => i !== neighbor)].slice(
          0,
          2
        ),
        row2: [id],
      });
    }
  };

  return (
    <LayoutGroup id="hero-gallery">
      <motion.div
        layout
        className="grid h-[60vh] grid-cols-2 grid-rows-2 gap-4 lg:h-[calc(100svh-9rem)]"
      >
        {GALLERY.map((slot) => {
          const isRow1 = layout.row1.includes(slot.id);
          const rowArr = isRow1 ? layout.row1 : layout.row2;
          const isSelected = rowArr.length === 1 && rowArr[0] === slot.id;
          const gridRow = isRow1 ? 1 : 2;
          let gridColumn = '2';
          if (isSelected) gridColumn = '1 / span 2';
          else if (isRow1) {
            gridColumn = layout.row1.indexOf(slot.id) === 0 ? '1' : '2';
          } else {
            gridColumn = layout.row2.indexOf(slot.id) === 0 ? '1' : '2';
          }

          return (
            <motion.button
              key={slot.id}
              type="button"
              layoutId={`hero-gallery-${slot.id}`}
              onClick={() => handleExpand(slot.id)}
              style={{ gridRow, gridColumn }}
              className={cn(
                'group relative h-full w-full cursor-pointer overflow-hidden rounded-2xl shadow-xl transition-shadow duration-500 hover:shadow-2xl',
                isSelected ? 'z-30' : 'z-10'
              )}
              transition={{
                layout: { type: 'spring', stiffness: 100, damping: 25 },
              }}
              aria-label={`Expand ${slot.images[0]?.caption ?? 'photo'}`}
            >
              <RotatingImage
                images={slot.images}
                sizes="(max-width: 1023px) 50vw, 25vw"
                intervalMs={slot.intervalMs}
                priority={slot.id === 'a'}
              />
            </motion.button>
          );
        })}
      </motion.div>
    </LayoutGroup>
  );
}

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

export default function HeroSection() {
  return (
    <motion.section
      className="flex min-h-[calc(100svh-4rem)] w-full items-center py-10"
      initial={{ opacity: 0, y: 50 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <style>{BLINK_CSS}</style>
      <div className="container mx-auto px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
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
              <h1 className="font-black text-4xl leading-tight tracking-normal md:text-6xl">
                <span className="text-brand-dark-blue underline decoration-4 decoration-brand-light-yellow underline-offset-8 dark:text-brand-white">
                  NEO CULTURE
                </span>
                <br />
                <span className="text-brand-light-blue">TECH</span>
              </h1>
            </div>

            {/* Description */}
            <p className="mb-4 font-medium text-foreground text-lg leading-relaxed md:max-w-lg">
              Founded in 2020, we are the best club for{' '}
              <span className="border-brand-light-yellow border-b-2 text-brand-light-blue">
                SSET students
              </span>{' '}
              to explore the world of technology at RMIT University.
            </p>

            {/* Recruitment status */}
            <div className="mb-8 flex items-center gap-2 font-semibold text-brand-light-blue text-sm">
              <span className="nct-blink inline-block h-2 w-2 rounded-full bg-green-500" />
              <span className="nct-blink">
                Recruitment now for Semester C - 2026
              </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link
                  href="https://rmitnct.site/recruitment"
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

          {/* Right Column — click-to-expand gallery of rotating photos */}
          {/* Height knob: tweak `h-[60vh]` (mobile) / `lg:h-[calc(100svh-9rem)]`
              inside ExpandingPhotoGrid. */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <ExpandingPhotoGrid />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
