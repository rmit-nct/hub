'use client';

import AnimatedSection from '../animated-section';
import AvatarCard from '../avatar-card';
import { mentors } from './data';

function calculateDelay(index: number) {
  const row = Math.floor(index / 4);
  const col = index % 4;
  return row * 0.1 + col * 0.05;
}

export default function MentorsSection() {
  return (
    <section id="mentors" className="px-6 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl md:text-4xl tracking-wide">
            <span className="font-medium text-brand-teal italic">
              MENTORS &{' '}
            </span>
            <span className="relative inline-block font-black text-brand-teal">
              JUDGES
              <span className="absolute left-0 -bottom-1 h-1 w-full bg-yellow-400"></span>
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-foreground/70 text-lg">
            Learn from and be evaluated by distinguished faculty from RMIT
            School of Science, Engineering & Technology.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {mentors.map((mentor, index) => (
            <AnimatedSection key={index} delay={calculateDelay(index)}>
              <AvatarCard
                avatar={mentor.avatar}
                name={mentor.name}
                subtitle={mentor.field}
                avatarClassName="ease-in-out transition-transform duration-500 hover:scale-105"
                nameClassName="gradient-text"
                subtitleClassName="text-sm opacity-80"
              />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
