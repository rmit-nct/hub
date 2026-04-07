'use server';

import { createClient } from '@ncthub/supabase/next/server';
import { revalidatePath } from 'next/cache';
import { customAlphabet } from 'nanoid';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const generateSlug = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  6
);

const SHORT_LINK_LIMIT = 30;
const SHORTENER_PAGE_PATH = '/neo-shortener';

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

const deleteShortLinkSchema = z.string().uuid('Invalid short link id');

const SHORT_LINK_LIMIT_ERROR =
  'You have reached the 30-link limit for your account';

export interface CreatedShortLink {
  createdAt: string;
  creatorId: string;
  domain: string;
  id: string;
  link: string;
  shortUrl: string;
  slug: string;
}

export interface ShortLinksOverview {
  isAuthenticated: boolean;
  limit: number;
  remainingCount: number;
  usedCount: number;
  links: CreatedShortLink[];
}

type ShortenedLinkRow = {
  created_at: string;
  creator_id: string;
  domain: string;
  id: string;
  link: string;
  slug: string;
};

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

function mapShortenedLink(row: ShortenedLinkRow): CreatedShortLink {
  const shortenerBaseUrl = resolveShortenerBaseUrl();

  return {
    createdAt: row.created_at,
    creatorId: row.creator_id,
    domain: row.domain,
    id: row.id,
    link: row.link,
    shortUrl: `${shortenerBaseUrl}/${row.slug}`,
    slug: row.slug,
  };
}

async function getAuthState() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return {
    supabase,
    user: user ?? null,
    error,
  };
}

async function requireAuthenticatedUser() {
  const { supabase, user, error } = await getAuthState();

  if (error || !user) {
    if (error) {
      console.error(error);
    }

    redirect(`/login?nextUrl=${encodeURIComponent(SHORTENER_PAGE_PATH)}`);
  }

  return { supabase, user };
}

export async function getMyShortLinksOverview(): Promise<ShortLinksOverview> {
  const { supabase, user, error } = await getAuthState();

  if (error) {
    console.error(error);
  }

  if (!user) {
    return {
      isAuthenticated: false,
      limit: SHORT_LINK_LIMIT,
      usedCount: 0,
      remainingCount: SHORT_LINK_LIMIT,
      links: [],
    };
  }

  const { data, error: queryError } = await supabase
    .from('shortened_links')
    .select('id, link, slug, domain, creator_id, created_at')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  if (queryError) {
    console.error(queryError);
    throw new Error(queryError.message || 'Failed to load your short links');
  }

  const links = (data ?? []).map((row) =>
    mapShortenedLink(row as ShortenedLinkRow)
  );

  return {
    isAuthenticated: true,
    limit: SHORT_LINK_LIMIT,
    usedCount: links.length,
    remainingCount: Math.max(SHORT_LINK_LIMIT - links.length, 0),
    links,
  };
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

  const { supabase, user } = await requireAuthenticatedUser();

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
      const createdLink = mapShortenedLink(data as ShortenedLinkRow);
      revalidatePath(SHORTENER_PAGE_PATH);
      return createdLink;
    }

    if (error?.code === '23505') {
      if (requestedSlug) {
        throw new Error('That custom slug is already taken');
      }

      continue;
    }

    if (error?.message?.includes(SHORT_LINK_LIMIT_ERROR)) {
      throw new Error(SHORT_LINK_LIMIT_ERROR);
    }

    console.error(error);
    throw new Error(error?.message || 'Failed to create short link');
  }

  throw new Error('Could not generate a unique short link after 10 attempts');
}

export async function deleteShortLink(shortLinkId: string) {
  const parsedId = deleteShortLinkSchema.safeParse(shortLinkId);

  if (!parsedId.success) {
    throw new Error(
      parsedId.error.issues[0]?.message || 'Invalid short link id'
    );
  }

  const { supabase, user } = await requireAuthenticatedUser();

  const { data, error } = await supabase
    .from('shortened_links')
    .delete()
    .eq('id', parsedId.data)
    .eq('creator_id', user.id)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error(error.message || 'Failed to delete short link');
  }

  if (!data) {
    throw new Error('Short link not found or you do not have permission');
  }

  revalidatePath(SHORTENER_PAGE_PATH);

  return { deletedId: data.id };
}