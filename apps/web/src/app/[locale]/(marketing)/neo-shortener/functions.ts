'use server';

import { createClient } from '@ncthub/supabase/next/server';
import { customAlphabet } from 'nanoid';
import { redirect } from 'next/navigation';
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
    redirect(`/login?nextUrl=${encodeURIComponent('/neo-shortener')}`);
  }

  const attemptLimit = requestedSlug ? 1 : 10;

  for (let attempt = 0; attempt < attemptLimit; attempt++) {
    const slug = requestedSlug || generateSlug();

    const { data, error } = await supabase
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
