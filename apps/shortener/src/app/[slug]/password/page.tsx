import { notFound } from 'next/navigation';
import { isValidUrl } from '@/lib/utils';
import InvalidLinkPage from '../invalid-link-page';
import PasswordForm from '../password-form';
import { loadShortLinkBySlug } from '../short-link';

export default async function PasswordPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shortenedLink = await loadShortLinkBySlug(slug);

  if (!shortenedLink) {
    notFound();
  }

  if (!isValidUrl(shortenedLink.link)) {
    return <InvalidLinkPage />;
  }

  if (!shortenedLink.password_hash) {
    notFound();
  }

  return (
    <PasswordForm
      linkId={shortenedLink.id}
      slug={slug}
      hint={shortenedLink.password_hint}
    />
  );
}
