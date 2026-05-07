'use server';

import { createClient } from '@ncthub/supabase/next/server';
import { customAlphabet } from 'nanoid';
import { z } from 'zod';

const generateSlug = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  6
);

const slugSchema = z
  .string()
  .trim()
  .min(3, 'Custom slug must be at least 3 characters')
  .max(32, 'Custom slug must be 32 characters or fewer')
  .regex(
    /^[a-zA-Z0-9\-_]+$/,
    'Custom slug can only contain letters, numbers, hyphens, and underscores'
  );

const createShortLinkSchema = z.object({
  url: z.string().trim().min(1, 'URL is required'),
  customSlug: z.string().optional().default(''),
});

export interface CreatedShortLink {
  createdAt: string;
  creatorId: string;
  domain: string;
  id: string;
  link: string;
  shortUrl: string;
  slug: string;
}

// Returned by createDynamicQRUrl and consumed by the QR generator frontend.
// Carries everything the UI needs: the short URL to encode, the slug for
// future updates, the creation timestamp, and the original destination.
export interface DynamicQRMetadata {
  shortUrl: string;
  slug: string;
  createdAt: string;
  originalUrl: string;
}

function resolveShortenerBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SHORTENER_URL ||
    (process.env.NODE_ENV === 'development'
      ? 'http://localhost:3002'
      : 'https://nct.gg')
  );
}

function hasExplicitScheme(value: string) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value);
}

function parseHttpUrl(value: string) {
  const trimmed = value.trim();
  const candidate = hasExplicitScheme(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;

  try {
    url = new URL(candidate);
  } catch {
    throw new Error('Please enter a valid URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Please enter a valid URL');
  }

  return url;
}

function getDomainFromShortenerBaseUrl() {
  try {
    return new URL(resolveShortenerBaseUrl()).host;
  } catch {
    return process.env.NODE_ENV === 'development' ? 'localhost:3002' : 'nct.gg';
  }
}

export async function createShortLink(
  formData: FormData
): Promise<CreatedShortLink> {
  const parsedValues = createShortLinkSchema.safeParse({
    url: formData.get('url'),
    customSlug: formData.get('customSlug') || '',
  });

  if (!parsedValues.success) {
    throw new Error(
      parsedValues.error.issues[0]?.message || 'Invalid form data'
    );
  }

  const normalizedUrl = parseHttpUrl(parsedValues.data.url);
  const requestedSlug = parsedValues.data.customSlug.trim();
  const shortenerBaseUrl = resolveShortenerBaseUrl();
  const domain = getDomainFromShortenerBaseUrl();
  const parsedShortenerBaseUrl = new URL(shortenerBaseUrl);

  if (normalizedUrl.origin === parsedShortenerBaseUrl.origin) {
    throw new Error(
      'Please enter a destination URL, not an existing short link'
    );
  }

  if (requestedSlug) {
    const parsedSlug = slugSchema.safeParse(requestedSlug);

    if (!parsedSlug.success) {
      throw new Error(
        parsedSlug.error.issues[0]?.message || 'Invalid custom slug'
      );
    }
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(userError);
    throw new Error('Please sign in to create a short link');
  }

  const attemptLimit = requestedSlug ? 1 : 10;

  for (let attempt = 0; attempt < attemptLimit; attempt++) {
    const slug = requestedSlug || generateSlug();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (supabase as any)
      .from('shortened_links')
      .insert([
        {
          creator_id: user.id,
          domain,
          link: normalizedUrl.toString(),
          slug,
        },
      ])
      .select('id, link, slug, domain, creator_id, created_at')
      .single();

    const data = result.data as
      | (Omit<CreatedShortLink, 'createdAt' | 'creatorId'> & {
          created_at: string;
          creator_id: string;
        })
      | null;
    const error = result.error as { code: string; message: string } | null;

    if (!error && data) {
      return {
        createdAt: data.created_at,
        creatorId: data.creator_id,
        domain: data.domain,
        id: data.id,
        link: data.link,
        shortUrl: `${shortenerBaseUrl}/${data.slug}`,
        slug: data.slug,
      };
    }

    if (error?.code === '23505') {
      if (requestedSlug) {
        throw new Error('That custom slug is already taken');
      }

      continue;
    }

    console.error(error);
    throw new Error(error?.message || 'Failed to create short link');
  }

  throw new Error('Could not generate a unique short link after 10 attempts');
}

/**
 * Creates a short link from a URL string for dynamic QR code generation.
 *
 * Returns the full DynamicQRMetadata object so the frontend can:
 *  - encode `shortUrl` into the QR image
 *  - display `shortUrl` and `originalUrl` in the UI
 *  - store `slug` to call updateDynamicQRUrl later (change destination)
 *  - show `createdAt` in analytics / history views
 *
 * @param url - The destination URL to shorten
 */
export async function createDynamicQRUrl(
  url: string
): Promise<DynamicQRMetadata> {
  const formData = new FormData();
  formData.set('url', url);
  // Let any error from createShortLink bubble up as-is so the frontend
  // can distinguish auth errors from validation errors.
  const result = await createShortLink(formData);
  return {
    shortUrl: result.shortUrl,
    slug: result.slug,
    createdAt: result.createdAt,
    originalUrl: result.link,
  };
}

/**
 * Updates the destination URL of an existing dynamic QR code.
 *
 * This is what makes the QR code truly "dynamic": the printed QR image
 * never changes (it still encodes the same short URL), but scanning it
 * will now redirect to the new destination.
 *
 * Only the original creator can update their own link (enforced by
 * matching both `slug` and `creator_id` in the WHERE clause).
 *
 * @param slug      - The slug returned by createDynamicQRUrl
 * @param newUrl    - The new destination URL
 */
export async function updateDynamicQRUrl(
  slug: string,
  newUrl: string
): Promise<void> {
  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) {
    throw new Error(parsedSlug.error.issues[0]?.message || 'Invalid slug');
  }

  const normalizedUrl = parseHttpUrl(newUrl);

  const shortenerBaseUrl = resolveShortenerBaseUrl();
  const parsedShortenerBaseUrl = new URL(shortenerBaseUrl);

  // Prevent turning a short link into a redirect loop back to the shortener.
  if (normalizedUrl.origin === parsedShortenerBaseUrl.origin) {
    throw new Error(
      'Please enter a destination URL, not an existing short link'
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Please sign in to update this link');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('shortened_links')
    .update({ link: normalizedUrl.toString() })
    .eq('slug', slug)
    .eq('creator_id', user.id); // security: only the owner can update

  if (error) {
    console.error(error);
    throw new Error(error.message || 'Failed to update short link');
  }
}

/**
 * Fetches the current metadata for a dynamic QR code by slug.
 *
 * Useful for the "edit destination" UI: load the current destination
 * URL into the input field before the user types a new one.
 *
 * @param slug - The slug returned by createDynamicQRUrl
 */
export async function getDynamicQRMetadata(
  slug: string
): Promise<DynamicQRMetadata> {
  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) {
    throw new Error(parsedSlug.error.issues[0]?.message || 'Invalid slug');
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Please sign in to view this link');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('shortened_links')
    .select('link, slug, created_at')
    .eq('slug', slug)
    .eq('creator_id', user.id)
    .single();

  if (error || !data) {
    throw new Error('Short link not found or you do not have access to it');
  }

  const shortenerBaseUrl = resolveShortenerBaseUrl();

  return {
    shortUrl: `${shortenerBaseUrl}/${data.slug}`,
    slug: data.slug,
    createdAt: data.created_at,
    originalUrl: data.link,
  };
}
     