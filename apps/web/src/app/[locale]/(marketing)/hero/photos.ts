export interface HeroPhoto {
  src: string;
  alt: string;
}

// Add/remove a photo = one line. Drop new files in
// public/media/marketing/hero/ (landscape 16:9, optimized).
export const heroPhotos: HeroPhoto[] = [
  { src: '/club-day/sem-a-2026.jpg', alt: 'NCT Club Day' },
  {
    src: '/media/marketing/events/netcompany-tour.jpg',
    alt: 'Netcompany company tour',
  },
  {
    src: '/media/marketing/events/netcompany-talk-show.jpg',
    alt: 'Neo Connect x Netcompany talk show',
  },
  { src: '/media/marketing/workshops/cv-workshop.jpg', alt: 'CV workshop' },
  {
    src: '/media/marketing/neo-league/neo-league-2025.png',
    alt: 'NEO League 2025',
  },
  { src: '/club-day/sem-c-2025.png', alt: 'NCT Club Day 2025' },
  { src: '/club-day/sem-b-2024.jpg', alt: 'NCT Club Day 2024' },
];
