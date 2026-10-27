'use client';

import { Badge } from '@ncthub/ui/badge';
import { Button } from '@ncthub/ui/button';
import { ArrowRight, Calendar, Clock, MapPin } from '@ncthub/ui/icons';
import { cn } from '@ncthub/utils/format';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

type EventType = {
  src: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string; // event category — drives the color-coded badge
  href?: string; // present => renders a "See details" button (past events)
};

const FACEBOOK_PAGE =  `https://www.facebook.com/rmit.nct`;
// Each event category gets its own badge color.
const TYPE_STYLES: Record<string, string> = {
  Competition: 'bg-amber-500/90 text-white hover:bg-amber-500',
  Networking: 'bg-violet-500/90 text-white hover:bg-violet-500',
  Workshop: 'bg-sky-500/90 text-white hover:bg-sky-500',
  'Company Tour': 'bg-emerald-500/90 text-white hover:bg-emerald-500',
};

const DEFAULT_TYPE_STYLE =
  'bg-brand-light-blue/90 text-white hover:bg-brand-light-blue';

// Dot colors for the scrolling type ticker (mirrors the badge colors).
const EVENT_TYPES = [
  { label: 'Competition', dot: 'bg-amber-500' },
  { label: 'Networking', dot: 'bg-violet-500' },
  { label: 'Workshop', dot: 'bg-sky-500' },
  { label: 'Company Tour', dot: 'bg-emerald-500' },
  { label: 'Social', dot: 'bg-pink-500' },
];

const TICKER_CSS = `
@keyframes evt-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.evt-marquee-track { animation: evt-marquee 30s linear infinite; }
.evt-marquee:hover .evt-marquee-track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .evt-marquee-track { animation: none; }
}
`;

function TypeTicker() {
  // Repeat enough to fill wide screens, then duplicate for a seamless -50% loop.
  const base = [...EVENT_TYPES, ...EVENT_TYPES, ...EVENT_TYPES];
  const track = [...base, ...base];
  return (
    <div className="evt-marquee overflow-hidden [-webkit-mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <style>{TICKER_CSS}</style>
      <div className="evt-marquee-track flex w-max items-center">
        {track.map((t, i) => (
          <span key={`${t.label}-${i}`} className="flex items-center">
            <span className="flex shrink-0 items-center gap-2 px-5 font-medium text-muted-foreground text-sm uppercase tracking-wider">
              <span
                aria-hidden="true"
                className={cn('h-2 w-2 rounded-full', t.dot)}
              />
              {t.label}
            </span>
            <span aria-hidden="true" className="text-muted-foreground/30">
              ·
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Upcoming: teaser only — all meta is TBA, "Coming Soon" CTA, no link.
const upcomingEvents: EventType[] = [
  {
    src: '/media/logos/og-image.png',
    title: 'Neo League Season 3',
    description:
      'Our flagship innovation challenge returns — bigger, bolder, and open to new builders.', // phải sửa 
    date: 'TBA',
    location: 'TBA',
    type: 'Competition',
  },
  {
    src: '/media/logos/og-image.png',
    title: 'NCT x SSET Net Company Tour',
    description: 'Industry talks and networking with our partners.',
    date: 'TBA',
    location: 'TBA',
    type: 'Company Tour',
  },
  {
    src: '/media/logos/og-image.png',
    title: 'AI Prompting Workshops',
    description: 'Hands-on sessions to learn to prompt AI ',
    date: 'TBA',
    location: 'TBA',
    type: 'Workshop',
  },
];

// Past: full info card, each links to its own Facebook post.
const pastEvents: EventType[] = [
  {
    src: '/media/marketing/landing-page/event/neo_league_season2_end.jpg',
    title: 'Neo League Season 2 - Innovation Humanity Challenge',
    description: 'Our competition about innovation solving and building IOT.',
    date: '03/2026',
    location: 'RMIT Campus',
    type: 'Competition',
    href: "https://www.facebook.com/rmit.neoleague",
  },
  {
    src: '/media/marketing/landing-page/event/nab_company.jpeg',
    title: 'NAB Company Tour',
    description: 'A guided company tour with demos and networking for members.',
    date: '10/2025',
    location: 'NAB Company Campus',
    type: 'Company Tour',
    href: 'https://www.facebook.com/share/p/19rxE1dLpX/',
  },
  {
    src: '/media/marketing/landing-page/event/hr_ws.jpg',
    title: 'Communication Workshop',
    description: 'Break the barriers, build the connections!',
    date: '08/2026',
    location: 'RMIT Campus',
    type: 'Workshop',
    href: 'https://www.facebook.com/share/p/1EWRpLa5P6/',
  },
];

function EventCard({
  event,
  variant,
}: {
  event: EventType;
  variant: 'featured' | 'compact';
}) {
  const featured = variant === 'featured';
  return (
    <div
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/50 shadow-xl transition-all duration-500 hover:shadow-2xl',
        featured ? 'min-h-[18rem] md:min-h-[26rem]' : 'min-h-[15rem]'
      )}
    >
      <Image
        src={event.src}
        alt={event.title}
        fill
        sizes={
          featured
            ? '(max-width: 767px) 100vw, 60vw'
            : '(max-width: 767px) 100vw, 30vw'
        }
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent" />

      {/* Type pill — color-coded per category */}
      <div className="relative p-5">
        <Badge className={TYPE_STYLES[event.type] ?? DEFAULT_TYPE_STYLE}>
          {event.type}
        </Badge>
      </div>

      {/* Content */}
      <div className="relative mt-auto p-5 text-white sm:p-6">
        <h3
          className={cn(
            'font-bold leading-tight',
            featured ? 'text-2xl sm:text-3xl' : 'text-lg'
          )}
        >
          {event.title}
        </h3>
        <p
          className={cn(
            'mt-2 text-white/80',
            featured ? 'text-sm sm:text-base' : 'text-sm'
          )}
        >
          {event.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/90">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {event.date}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {event.location}
          </span>
        </div>
        {event.href ? (
          <Link
            href={event.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block"
          >
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 text-black hover:bg-white"
            >
              See details
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            disabled
            className="mt-4 bg-white/20 text-white disabled:opacity-100"
          >
            <Clock className="mr-1.5 h-4 w-4" />
            Coming Soon
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Events() {
  const reduceMotion = useReducedMotion();

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay },
          viewport: { once: true },
        };

  return (
    <section id="events" className="container mx-auto mt-12 p-6 sm:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <motion.div
          {...reveal(0.1)}
          className="mb-4 inline-flex items-center gap-2"
        >
          <Calendar className="h-6 w-6 text-brand-light-yellow" />
          <Badge
            variant="outline"
            className="border-brand-light-blue/50 px-4 py-2 text-base text-brand-light-blue"
          >
            Introducing Club Events
          </Badge>
          <Calendar className="h-6 w-6 text-brand-light-yellow" />
        </motion.div>

        <h2 className="mb-3 pb-2 font-bold text-3xl md:text-6xl lg:text-7xl">
          Upcoming{' '}
          <span className="whitespace-nowrap border-brand-light-yellow border-b-4 text-brand-light-blue">
            Events
          </span>
        </h2>

        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Don't miss what's coming up this semester
        </p>
      </div>

      {/* Running line of all event types */}
      <motion.div {...reveal(0.1)} className="mb-8">
        <TypeTicker />
      </motion.div>

      {/* Upcoming bento (no panel) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <motion.div {...reveal(0.05)} className="md:col-span-3">
          <EventCard event={upcomingEvents[0]!} variant="featured" />
        </motion.div>
        <div className="flex flex-col gap-6 md:col-span-2">
          {upcomingEvents.slice(1).map((event, i) => (
            <motion.div key={event.title} {...reveal(0.1 + i * 0.1)}>
              <EventCard event={event} variant="compact" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Past highlights */}
      <div className="mt-12">
        <motion.div {...reveal(0.05)} className="mb-6">
          <span className="font-semibold text-brand-light-blue text-sm uppercase tracking-[0.25em]">
            — Past Events
          </span>
          <h3 className="mt-1 font-bold text-2xl md:text-3xl">
            Past Highlights
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pastEvents.map((event, i) => (
            <motion.div key={event.title} {...reveal(0.1 + i * 0.1)}>
              <EventCard event={event} variant="compact" />
            </motion.div>
          ))}
        </div>

        <motion.div {...reveal(0.2)} className="mt-8 text-center">
          <Link href={FACEBOOK_PAGE} target="_blank" rel="noopener noreferrer">
            <Button size="lg">
              See all events on Facebook
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
