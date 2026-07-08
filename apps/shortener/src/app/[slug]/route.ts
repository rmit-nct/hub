import { after, NextResponse } from 'next/server';
import { trackLinkClick } from '@/lib/analytics';
import { isValidUrl } from '@/lib/utils';
import { loadShortLinkBySlug } from './short-link';

export const preferredRegion = 'sin1';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const shortenedLink = await loadShortLinkBySlug(slug);

  if (!shortenedLink) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }

  if (!isValidUrl(shortenedLink.link)) {
    return NextResponse.redirect(new URL(`/${slug}/invalid`, request.url), 307);
  }

  if (shortenedLink.password_hash) {
    return NextResponse.redirect(
      new URL(`/${slug}/password`, request.url),
      307
    );
  }

  after(async () => {
    await trackLinkClick(shortenedLink.id, slug);
  });

  return NextResponse.redirect(shortenedLink.link, 307);
}
