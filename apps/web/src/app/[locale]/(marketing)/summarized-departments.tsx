'use client';

import { Badge } from '@ncthub/ui/badge';
import { Button } from '@ncthub/ui/button';
import { Card } from '@ncthub/ui/card';
import {
  ArrowRight,
  Code,
  Handshake,
  type LucideIcon,
  Megaphone,
  Network,
  Users,
} from '@ncthub/ui/icons';
import { cn } from '@ncthub/utils/format';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { type CoreDepartmentName, departments } from './about/data';

type Accent = {
  icon: LucideIcon;
  text: string;
  chip: string;
  button: string;
  cardAccent: string;
  image: string;
};

// Per-department accent + curated image (icon/colors are presentation-only;
// all text comes from about/data.ts).
const ACCENTS: Record<CoreDepartmentName, Accent> = {
  Technology: {
    icon: Code,
    text: 'text-dynamic-blue',
    chip: 'bg-dynamic-blue/10 text-dynamic-blue',
    button: 'bg-dynamic-blue text-white hover:bg-dynamic-blue/90',
    cardAccent:
      'border-dynamic-blue/30 bg-dynamic-blue/5 hover:border-dynamic-blue/50 hover:bg-dynamic-blue/10',
    image: '/departments/technology/competitive-programming-workshop.jpg',
  },
  'Human Resources': {
    icon: Users,
    text: 'text-dynamic-purple',
    chip: 'bg-dynamic-purple/10 text-dynamic-purple',
    button: 'bg-dynamic-purple text-white hover:bg-dynamic-purple/90',
    cardAccent:
      'border-dynamic-purple/30 bg-dynamic-purple/5 hover:border-dynamic-purple/50 hover:bg-dynamic-purple/10',
    image: '/departments/human-resources/secret-santa-c-2025.jpg',
  },
  Marketing: {
    icon: Megaphone,
    text: 'text-dynamic-orange',
    chip: 'bg-dynamic-orange/10 text-dynamic-orange',
    button: 'bg-dynamic-orange text-white hover:bg-dynamic-orange/90',
    cardAccent:
      'border-dynamic-orange/30 bg-dynamic-orange/5 hover:border-dynamic-orange/50 hover:bg-dynamic-orange/10',
    image: '/departments/marketing/nct-marketing.jpg',
  },
};

const CORE_NAMES: CoreDepartmentName[] = [
  'Technology',
  'Human Resources',
  'Marketing',
];

const deptCards = CORE_NAMES.map((name) => {
  const data = departments.find((d) => d.name === name);
  return {
    name,
    tagline: data?.characteristics.bio ?? '',
    activities: (data?.activities.items ?? []).slice(0, 3).map((i) => i.title),
    badges: (data?.characteristics.badges ?? []).slice(0, 3),
    ...ACCENTS[name],
  };
});

export default function SummarizedDepartments() {
  const reduceMotion = useReducedMotion();

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay },
          viewport: { once: true },
        };

  return (
    <section id="about-departments" className="container mx-auto p-6 sm:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <motion.div
          {...reveal(0.1)}
          className="mb-6 inline-flex items-center gap-2"
        >
          <Network className="h-6 w-6 text-brand-light-yellow" />
          <Badge
            variant="outline"
            className="border-brand-light-blue/50 px-4 py-2 text-base text-brand-light-blue"
          >
            Introducing Club Structure
          </Badge>
          <Network className="h-6 w-6 text-brand-light-yellow" />
        </motion.div>

        <h2 className="mb-4 pb-4 font-bold text-4xl md:text-6xl lg:text-8xl">
          Our{' '}
          <span className="whitespace-nowrap border-brand-light-yellow border-b-4 text-brand-light-blue">
            Departments
          </span>
        </h2>

        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Three teams, one mission
        </p>
      </div>

      {/* Panel */}
      <div className="rounded-3xl border border-border/50 bg-background/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8 md:p-10">
        <div className="grid gap-6 md:grid-cols-3">
          {deptCards.map((dept, index) => (
            <motion.div key={dept.name} {...reveal(index * 0.12)}>
              <Card
                className={cn(
                  'group flex h-full flex-col gap-0 overflow-hidden border py-0 transition-all duration-300 hover:-translate-y-1',
                  dept.cardAccent
                )}
              >
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={dept.image}
                    alt={`${dept.name} department`}
                    fill
                    sizes="(max-width: 767px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div>
                    <h3
                      className={cn(
                        'flex items-center gap-2 font-bold text-xl',
                        dept.text
                      )}
                    >
                      <dept.icon className="h-5 w-5" aria-hidden="true" />
                      {dept.name}
                    </h3>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {dept.tagline}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      What we do
                    </span>
                    <ul className="mt-2 space-y-1.5">
                      {dept.activities.map((act) => (
                        <li
                          key={act}
                          className="flex items-center gap-2 text-foreground/80 text-sm"
                        >
                          <ArrowRight
                            aria-hidden="true"
                            className={cn('h-3.5 w-3.5 shrink-0', dept.text)}
                          />
                          {act}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {dept.badges.map((b) => (
                      <span
                        key={b}
                        className={cn(
                          'rounded-full px-2.5 py-1 font-medium text-xs',
                          dept.chip
                        )}
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-2">
                    <Link
                      href={`/about?department=${encodeURIComponent(dept.name)}#about-departments`}
                      className="group/cta inline-block"
                    >
                      <Button
                        className={cn(
                          'transition-all duration-300',
                          dept.button
                        )}
                      >
                        Explore {dept.name}
                        <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Closing collaboration line */}
        <motion.p
          {...reveal(0.2)}
          className="mt-10 border-border/50 border-t pt-8 text-center font-medium text-base text-muted-foreground sm:text-lg"
        >
          <span className="font-bold text-dynamic-blue">Technology</span> builds
          it, <span className="font-bold text-dynamic-orange">Marketing</span>{' '}
          shares it, and{' '}
          <span className="font-bold text-dynamic-purple">Human Resources</span>{' '}
          brings everyone together.
          <Handshake
            aria-hidden="true"
            className="ml-2 inline-block h-5 w-5 align-text-bottom text-brand-light-yellow"
          />
        </motion.p>
      </div>
    </section>
  );
}
