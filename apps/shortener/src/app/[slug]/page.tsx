import ServerPage from './server-page';

interface RedirectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  return <ServerPage params={params} />;
}
