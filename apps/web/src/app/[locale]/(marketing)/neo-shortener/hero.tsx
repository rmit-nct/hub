'use client';

import { Badge } from '@ncthub/ui/badge';
import { Sparkles } from '@ncthub/ui/icons';
import { motion } from 'framer-motion';

export default function NeoShortenerHero() {
  return (
    <motion.div
      className="space-y-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="inline-flex items-center gap-2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.15 }}
      >
        <Sparkles className="h-5 w-5 text-[#FBC721]" />
        <Badge
          variant="outline"
          className="border-[#5FC6E5]/50 bg-white/60 px-3 py-1 text-[#127A9B] text-sm"
        >
          Link Shortener
        </Badge>
        <Sparkles className="h-5 w-5 text-[#FBC721]" />
      </motion.div>

      <motion.h1
        className="font-bold text-4xl text-foreground tracking-tight md:text-5xl lg:text-6xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
      >
        Build shareable links with{' '}
        <span className="border-[#FBC721] border-b-4 text-[#5FC6E5]">
          Neo Shortener
        </span>
      </motion.h1>

      <motion.p
        className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        Turn long URLs into clean short links with support for custom slugs and
        simple sharing.
      </motion.p>
    </motion.div>
  );
}
