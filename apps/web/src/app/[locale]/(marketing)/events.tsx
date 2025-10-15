'use client';

import { Badge } from '@ncthub/ui/badge';
import { Button } from '@ncthub/ui/button';
import { Card, CardContent } from '@ncthub/ui/card';
import {
  ArrowRight,
  Calendar,
  Camera,
  MapPin,
  Sparkles,
  Users,
} from '@ncthub/ui/icons';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

type EventType = {
  src: string;
  title: string;
  description: string;
  date: string;
  attendees: string;
  location: string;
  link?: string;
};

const EventImages: EventType[] = [
  {
    src: '/club-day/sem-b-2025.png',
    title: 'Club Day Semester B 2025',
    description: 'Join us for an exciting club day experience',
    date: 'July 2025',
    attendees: '100+',
    location: 'RMIT Campus',
  },
  {
    src: '/media/marketing/neo-league/neo-league-2025.png',
    title: 'Neo League - Prompt The Future 2025',
    description: 'AI prompt engineering competition',
    date: 'June 2025',
    attendees: '170+',
    location: 'RMIT Campus',
    link: 'https://nova.ai.vn',
  },
  {
    src: '/media/marketing/events/cyber-security-mental-peace-event.jpg',
    title: 'Cybersecurity & Mental Peace',
    description: 'Professional development session',
    date: 'May 2025',
    attendees: '50+',
    location: 'RMIT Campus',
    link: 'https://www.facebook.com/rmit.nct/posts/pfbid0h43xjHEiKqqFZ5Y9R8ZVHyKLPae3SNuY8GmQu8ZkbPnMchJYyg9JFkFRA7T3e5m4l',
  },
  {
    src: '/media/marketing/workshops/arduino-workshop.png',
    title: 'Internal Training: Arduino Workshop',
    description: 'Internal Training for Technology Department Members',
    date: 'April 2025',
    attendees: '20+',
    location: 'RMIT Campus',
    link: 'https://www.facebook.com/rmit.nct/posts/pfbid08CE3yHibWS8E792erbtCghTbhaM6BjJpfHUDyWMW7nPXeA2Ayk6pBQRSU11jSMb6l',
  },
  {
    src: '/club-day/sem-a-2025.jpg',
    title: 'Club Day Sem A 2025',
    description: 'Join us for an exciting club day experience',
    date: 'March 2025',
    attendees: '100+',
    location: 'RMIT Campus',
    link: 'https://www.facebook.com/rmit.nct/posts/pfbid023wQjN37mxrEk9oSx77RDzE4BftZcxRxZgwNTH7b25VmZNd5ZK6J9uJBQAZDL1duYl',
  },
];

export default function Events() {
  return (
    <motion.div
      id="events"
      className="relative w-full py-8"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mb-12 text-center"
      >
        <div className="mb-4 inline-flex items-center gap-2">
          <Camera className="text-primary h-6 w-6" />
          <Badge variant="outline" className="px-3 py-1 text-sm">
            Our Events
          </Badge>
          <Camera className="text-primary h-6 w-6" />
        </div>

        <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
          Memorable{' '}
          <span className="from-primary to-secondary bg-gradient-to-r bg-clip-text text-transparent">
            Moments
          </span>
        </h2>

        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Experience the highlights of our vibrant community through these
          unforgettable events
        </p>
      </motion.div>

      {/* Events Grid */}
      <div className="border-border/50 bg-background/60 rounded-3xl border p-6 shadow-2xl backdrop-blur-xl md:p-8">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Primary Event Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-2 lg:col-span-2"
          >
            <PrimaryEventCard event={EventImages[0]!} />
          </motion.div>

          {/* Secondary Event Cards */}
          {EventImages.slice(1).map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
              viewport={{ once: true }}
            >
              <SecondaryEventCard event={event} />
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="border-primary/20 from-primary/5 to-secondary/5 mx-auto max-w-md bg-gradient-to-r">
            <CardContent className="p-6">
              <Sparkles className="text-primary mx-auto mb-3 h-8 w-8" />
              <h3 className="mb-2 text-xl font-semibold">
                Join Our Next Event
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Don't miss out on our upcoming activities and networking
                opportunities
              </p>
              <Link
                href={'https://www.facebook.com/rmit.nct'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full">
                  View All Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-primary/10 absolute left-1/4 top-1/4 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-secondary/10 absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full blur-3xl" />
      </div>
    </motion.div>
  );
}

const PrimaryEventCard = ({ event }: { event: EventType }) => {
  return (
    <Link
      href={event.link ? event.link : 'https://www.facebook.com/rmit.nct'}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Card className="hover:border-primary/50 group relative h-full min-h-[400px] overflow-hidden border-2 transition-all duration-500 hover:shadow-2xl">
        <div className="relative h-full">
          <Image
            src={event.src}
            alt={event.title}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fill
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <Badge className="bg-primary/90 hover:bg-primary mb-3">
              Featured Event
            </Badge>

            <h3 className="mb-2 text-2xl font-bold">{event.title}</h3>
            <p className="mb-4 text-sm text-white/80">{event.description}</p>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{event.attendees}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

const SecondaryEventCard = ({ event }: { event: EventType }) => {
  return (
    <Link
      href={event.link ? event.link : 'https://www.facebook.com/rmit.nct'}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Card className="group relative h-48 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
        <div className="relative h-full">
          <Image
            src={event.src}
            alt={event.title}
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            fill
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h4 className="mb-1 text-sm font-semibold">{event.title}</h4>
            <p className="mb-2 text-xs text-white/70">{event.description}</p>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{event.attendees}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
