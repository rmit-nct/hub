'use client';

import { Badge } from '@ncthub/ui/badge';
import { Button } from '@ncthub/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ncthub/ui/card';
import {
  ArrowRight,
  Check,
  ExternalLink,
  Heart,
  Rocket,
  Sparkles,
  Users,
} from '@ncthub/ui/icons';
import { motion } from 'framer-motion';
import Link from 'next/link';

const reasons = [
  {
    title: 'HANDS-ON EXPERIENCE',
    icon: Rocket,
    description:
      'Learn by solving and building. Work on real projects, join technical workshops, and compete in challenges like Neo League that turn curiosity into real capability.',
    gradient: 'from-yellow-400 to-orange-500',
    features: [
      'Real Club Projects',
      'Technical Workshops',
      'Competitions & Hackathons',
      'Portfolio-ready Work',
    ],
    buttonText: 'See What We Do',
    link: '/about',
    isExternal: false,
    badgeText: 'Learn by Building',
  },
  {
    title: 'NETWORKING',
    icon: Users,
    description:
      'Build meaningful connections with industry professionals, experienced alumni, and passionate peers. Our network opens doors to internships, mentorships, and career opportunities.',
    gradient: 'from-blue-400 to-cyan-500',
    features: [
      'Industry Mentor Matching',
      'Peer Study Groups',
      'Professional Development',
      '24/7 Community Support',
    ],
    buttonText: 'Meet Our Team',
    link: '/about',
    isExternal: false,
    badgeText: 'Career Growth',
  },
  {
    title: 'MEMBERSHIP',
    icon: Heart,
    description:
      'Be part of a community that believes in inclusive growth and continuous learning. We welcome all students passionate about technology, regardless of their background or experience level.',
    gradient: 'from-purple-400 to-pink-500',
    features: [
      'Inclusive Learning Environment',
      'Knowledge Sharing Sessions',
      'Fun Tech Challenges',
      'Continuous Skill Development',
    ],
    buttonText: 'Join Neo Culture Tech',
    link: 'https://rmitnct.site/recruitment',
    isExternal: true,
    badgeText: 'Inclusive Community',
  },
];

const JD_BOOKLET = 'https://rmitnct.site/jdbooklet';

export default function WhyUs() {
  return (
    <motion.section
      id="why-us"
      className="container mx-auto flex flex-col p-6 sm:px-8"
      initial={{ opacity: 0, y: 50 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Header */}
      <div className="mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-6 inline-flex items-center gap-2"
        >
          <Sparkles className="h-6 w-6 text-brand-light-yellow" />
          <Badge
            variant="outline"
            className="border-brand-light-blue/50 px-4 py-2 text-base text-brand-light-blue"
          >
            Why Choose Us
          </Badge>
          <Sparkles className="h-6 w-6 text-brand-light-yellow" />
        </motion.div>

        <h2 className="mb-4 pb-4 font-bold text-4xl md:text-6xl lg:text-8xl">
          Why{' '}
          <span className="whitespace-nowrap border-brand-light-yellow border-b-4 text-brand-light-blue">
            Us?
          </span>
        </h2>

        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Discover what makes NEO Culture Tech the perfect choice for your
          technology journey
        </p>
      </div>

      {/* Cards Grid (no panel) */}
      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {reasons.map((reason, index) => (
          <motion.div
            key={reason.title}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <Card className="h-full border-2 bg-linear-to-br from-background/50 to-background shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
              <CardHeader className="pb-4 text-center">
                <div
                  className={`mx-auto mb-4 h-16 w-16 rounded-full bg-linear-to-r ${reason.gradient} p-0.5 transition-transform duration-300 group-hover:scale-105`}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
                    <reason.icon className="h-8 w-8 text-foreground transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>

                <CardTitle className="mb-2 font-bold text-xl md:text-2xl">
                  {reason.title}
                </CardTitle>

                <Badge
                  variant="secondary"
                  className={`bg-linear-to-r ${reason.gradient} mb-4 border-0 text-white shadow-sm`}
                >
                  {reason.badgeText}
                </Badge>
              </CardHeader>

              <CardContent className="pt-0">
                <CardDescription className="mb-6 text-base leading-relaxed">
                  {reason.description}
                </CardDescription>

                <div className="mb-6 space-y-2">
                  {reason.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-brand-light-blue"
                      />
                      <span className="text-muted-foreground text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {reason.isExternal ? (
                  <Link
                    href={reason.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${reason.buttonText} - Opens in new tab`}
                  >
                    <Button
                      variant="outline"
                      className="w-full transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg"
                    >
                      {reason.buttonText}
                      <ExternalLink className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={reason.link} aria-label={reason.buttonText}>
                    <Button
                      variant="outline"
                      className="w-full transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg"
                    >
                      {reason.buttonText}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
