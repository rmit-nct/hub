import { redirect } from 'next/navigation';

function getShortenerDashboardHref() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === 'development'
      ? 'http://localhost:7803'
      : 'https://rmitnct.club');

  return `${appUrl.replace(/\/$/, '')}/neo-shortener`;
}

export default function HomePage() {
  redirect(getShortenerDashboardHref());
}
