import { createAdminClient } from '@ncthub/supabase/next/server';

export interface ShortLinkRecord {
  id: string;
  link: string;
  password_hash: string | null;
  password_hint: string | null;
}

export async function loadShortLinkBySlug(slug: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseHost = supabaseUrl
    ? new URL(supabaseUrl).host
    : 'missing-supabase-url';
  const hasServiceKey = Boolean(
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let shortenedLink: ShortLinkRecord | null = null;

  try {
    const sbAdmin = await createAdminClient();

    const { data, error } = await sbAdmin
      .from('shortened_links')
      .select('id, link, password_hash, password_hint')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      throw new Error(error.message || 'Failed to load short link');
    }

    shortenedLink = data;

    // Dynamic QR codes live in a separate table (they don't count against the
    // shortener's link limit) but share the same slug namespace. If the slug
    // wasn't a regular short link, fall back to the dynamic QR table. These
    // never have password protection.
    if (!shortenedLink) {
      // `dynamic_qr_links` may not be in the generated Supabase types yet.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: qrData, error: qrError } = await (sbAdmin as any)
        .from('dynamic_qr_links')
        .select('id, link')
        .eq('slug', slug)
        .maybeSingle();

      if (qrError) {
        throw new Error(qrError.message || 'Failed to load dynamic QR link');
      }

      if (qrData) {
        shortenedLink = {
          id: qrData.id as string,
          link: qrData.link as string,
          password_hash: null,
          password_hint: null,
        };
      }
    }

    return shortenedLink;
  } catch (error) {
    console.error('Shortener lookup failed', {
      error: error instanceof Error ? error.message : String(error),
      cause:
        error instanceof Error && 'cause' in error
          ? String((error as Error & { cause?: unknown }).cause)
          : null,
      hasServiceKey,
      slug,
      supabaseHost,
    });
    throw error;
  }
}
