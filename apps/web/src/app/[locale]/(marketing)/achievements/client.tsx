'use client';

import AchievementDialog from './achievement-dialog';
import { type Achievement } from './data';
import { Badge } from '@ncthub/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ncthub/ui/card';
import { CalendarIcon, TrophyIcon, UsersIcon } from '@ncthub/ui/icons';
import { cn } from '@ncthub/utils/format';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

const categoryColors = {
  Hackathon: 'default',
  Competition: 'success',
  Contest: 'warning',
  Tournament: 'secondary',
} as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function TopThreeAchievements({
  achievements,
}: {
  achievements: Achievement[];
}) {
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Handle window resize and confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {/* Confetti Celebration */}
      <Confetti
        width={windowDimensions.width}
        height={windowDimensions.height}
        numberOfPieces={200}
        recycle={false}
        colors={['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3']}
      />
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto grid max-w-[80%] grid-cols-1 gap-6 md:grid-cols-2"
      >
        {achievements.map((achievement, index) => (
          <AchievementDialog
            key={achievement.id}
            achievement={achievement}
            trigger={
              <motion.div
                variants={item}
                className={cn(
                  index === 0 && 'col-span-1 md:col-span-2',
                  index === 1 && 'col-span-1',
                  index === 2 && 'col-span-1'
                )}
              >
                {index === 0 ? (
                  <SpecialAchievementCard achievement={achievement} />
                ) : (
                  <AchievementCard achievement={achievement} />
                )}
              </motion.div>
            }
          />
        ))}
      </motion.div>
    </>
  );
}

export function OtherAchievements({
  achievements,
}: {
  achievements: Achievement[];
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {achievements.map((achievement) => (
        <AchievementDialog
          key={achievement.id}
          achievement={achievement}
          trigger={
            <motion.div variants={item}>
              <AchievementCard achievement={achievement} />
            </motion.div>
          }
        />
      ))}
    </motion.div>
  );
}

function SpecialAchievementCard({ achievement }: { achievement: Achievement }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="group relative aspect-video cursor-pointer overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
      {/* Background Image */}
      <div className="absolute inset-0">
        {!imageError ? (
          <Image
            src={achievement.image}
            alt={achievement.competitionName}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <TrophyIcon className="h-24 w-24 text-muted-foreground" />
          </div>
        )}
        {/* Dark overlay for better text readability - reduces opacity on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 transition-opacity duration-300 group-hover:from-black/50 group-hover:via-black/20 group-hover:to-black/10" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex h-full flex-col p-6 text-white">
        {/* Top section with badges */}
        <div className="flex justify-end transition-all duration-300 group-hover:scale-90 group-hover:opacity-80">
          <span className="flex items-center gap-2 text-sm font-medium text-white/90">
            <CalendarIcon className="h-4 w-4" />
            {achievement.year}
          </span>
        </div>

        {/* Center section with main headers */}
        <div className="flex flex-1 items-center justify-center transition-all duration-300 group-hover:scale-75 group-hover:opacity-70">
          <div className="space-y-4 text-center">
            <h2 className="text-5xl leading-tight font-extrabold text-white transition-all duration-300">
              {achievement.competitionName}
            </h2>
            <h3 className="text-4xl font-semibold text-white/95 transition-all duration-300">
              {achievement.achievement}
            </h3>
          </div>
        </div>

        {/* Bottom section with team information */}
        <div className="flex items-center justify-center gap-2 text-white/80 transition-all duration-300 group-hover:scale-90 group-hover:opacity-80">
          <UsersIcon className="h-5 w-5" />
          <span className="font-medium">{achievement.teamName}</span>
          <span>•</span>
          <span>{achievement.teamMembers.length} members</span>
        </div>
      </div>
    </Card>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="group flex h-full cursor-pointer flex-col justify-between transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
      <CardHeader>
        <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg bg-muted">
          {!imageError ? (
            <Image
              src={achievement.image}
              alt={achievement.competitionName}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <TrophyIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="mb-2 flex items-center justify-between">
          <Badge
            variant={categoryColors[achievement.category]}
            className="text-xs"
          >
            {achievement.category}
          </Badge>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            {achievement.year}
          </span>
        </div>
        <CardTitle className="line-clamp-2 text-lg leading-tight">
          {achievement.competitionName}
        </CardTitle>
        <CardDescription className="text-base font-medium text-foreground">
          {achievement.achievement}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UsersIcon className="h-4 w-4" />
          <span className="font-medium">{achievement.teamName}</span>
          <span>•</span>
          <span>{achievement.teamMembers.length} members</span>
        </div>
      </CardContent>
    </Card>
  );
}
