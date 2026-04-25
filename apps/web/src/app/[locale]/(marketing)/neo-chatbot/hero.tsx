'use client';

import { Badge } from '@ncthub/ui/badge';
import { MessagesSquare, Sparkles } from '@ncthub/ui/icons';
import { motion } from 'framer-motion';
import GradientHeadline from '../gradient-headline';

interface NeoChatbotHeroProps {
  badge: string;
  title: string;
  description: string;
}

export default function NeoChatbotHero({
  badge,
  title,
  description,
}: NeoChatbotHeroProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-4xl border bg-card/70 px-6 py-10 text-center shadow-sm backdrop-blur-sm md:px-10 md:py-14"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,182,60,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(92,124,255,0.14),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      <motion.div
        className="relative mb-6 inline-flex items-center gap-3"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <Sparkles className="h-5 w-5 text-brand-light-yellow" />
        <Badge
          variant="outline"
          className="border-brand-light-blue/50 px-3 py-1 text-brand-light-blue text-sm"
        >
          {badge}
        </Badge>
        <MessagesSquare className="h-5 w-5 text-brand-light-yellow" />
      </motion.div>

      <motion.h1
        className="relative mb-5 text-balance font-bold text-4xl text-foreground md:text-5xl lg:text-6xl"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <GradientHeadline gradient="yellow-orange">{title}</GradientHeadline>
      </motion.h1>

      <motion.p
        className="relative mx-auto max-w-2xl text-balance text-lg text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.35 }}
      >
        {description}
      </motion.p>
    </motion.div>
  );
}
