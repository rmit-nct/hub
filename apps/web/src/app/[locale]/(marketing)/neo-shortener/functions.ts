'use server';

import { createAdminClient, createClient } from '@ncthub/supabase/next/server';
import bcrypt from 'bcrypt';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  buildDynamicQRAnalytics,
  type CreatedShortLink,
  checkShortLinkAccess,
  createShortLinkSchema,
  type DynamicQRAnalytics,
  type DynamicQRMetadata,
  deleteShortLinkSchema,
  generateSlug,
  getDomainFromShortenerBaseUrl,
  type LinkAnalyticsRow,
  logShortenerDebug,
  logShortenerDebugError,
  mapShortenedLink,
  parseHttpUrl,
  resolveShortenerBaseUrl,
  SHORT_LINK_LIMIT,
  SHORT_LINK_LIMIT_ERROR,
  SHORTENER_DEBUG_ENABLED,
  SHORTENER_PAGE_PATH,
  type ShortenedLinkRow,
  type ShortLinkDebugStep,
  type ShortLinksOverview,
  type SlugAvailabilityResult,
  slugSchema,
} from './shortener-server-utils';

export type {
  CreatedShortLink,
  DynamicQRAnalytics,
  DynamicQRDeviceStat,
  DynamicQRLocationStat,
  DynamicQRMetadata,
  DynamicQRRecentScan,
  ShortLinkDebugReport,
  ShortLinkDebugStep,
  ShortLinksOverview,
  SlugAvailabilityResult,
} from './shortener-server-utils';

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
    .select('id, link, slug, domain, creator_id, password_hash, created_at')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  if (queryError) {
    console.error(queryError);
    throw new Error('Failed to load your short links');
  }

  const links = data.map((row) => mapShortenedLink(row as ShortenedLinkRow));

  return {
    isAuthenticated: true,
    limit: SHORT_LINK_LIMIT,
    usedCount: links.length,
    remainingCount: Math.max(SHORT_LINK_LIMIT - links.length, 0),
    links,
  };
}

export async function checkShortLinkSlugAvailability(
  slug: string
): Promise<SlugAvailabilityResult> {
  const trimmedSlug = slug.trim();

  if (!trimmedSlug) {
    return {
      available: false,
      message: '',
      slug: '',
      status: 'empty',
    };
  }

  const parsedSlug = slugSchema.safeParse(trimmedSlug);

  if (!parsedSlug.success) {
    return {
      available: false,
      message: parsedSlug.error.issues[0]?.message || 'Invalid custom slug',
      slug: trimmedSlug,
      status: 'invalid',
    };
  }

  const { user, error: authError } = await getAuthState();

  if (authError) {
    console.error(authError);
  }

  if (!user) {
    return {
      available: false,
      message: 'Please sign in to check custom slug availability.',
      slug: parsedSlug.data,
      status: 'error',
    };
  }

  const sbAdmin = await createAdminClient();

  const { data, error } = await sbAdmin
    .from('shortened_links')
    .select('id')
    .eq('slug', parsedSlug.data)
    .maybeSingle();

  if (error) {
    console.error(error);

    return {
      available: false,
      message: 'Could not check this slug right now. You can try again soon.',
      slug: parsedSlug.data,
      status: 'error',
    };
  }

  if (data) {
    return {
      available: false,
      message: 'That custom slug is already taken',
      slug: parsedSlug.data,
      status: 'taken',
    };
  }

  return {
    available: true,
    message: 'This custom slug is available',
    slug: parsedSlug.data,
    status: 'available',
  };
}

export async function createShortLink(
  formData: FormData
): Promise<CreatedShortLink> {
  const debugSteps: ShortLinkDebugStep[] = [
    {
      name: 'debug_flag',
      status: 'ok',
      details: {
        enabled: SHORTENER_DEBUG_ENABLED,
      },
    },
  ];

  const parsedValues = createShortLinkSchema.safeParse({
    url: formData.get('url'),
    customSlug: formData.get('customSlug') || '',
    password: formData.get('password') || '',
    passwordHint: formData.get('passwordHint') || '',
  });

  if (!parsedValues.success) {
    logShortenerDebugError('short link form validation failed', {
      issues: parsedValues.error.issues.map((issue) => ({
        code: issue.code,
        message: issue.message,
        path: issue.path.join('.'),
      })),
    });

    throw new Error(
      parsedValues.error.issues[0]?.message || 'Invalid form data'
    );
  }

  let normalizedUrl: URL;

  try {
    normalizedUrl = parseHttpUrl(parsedValues.data.url);
  } catch (error) {
    logShortenerDebugError('destination URL parsing failed', {
      error: error instanceof Error ? error.message : String(error),
      input: parsedValues.data.url,
    });

    throw error;
  }

  const requestedSlug = parsedValues.data.customSlug.trim();
  const requestedPassword = parsedValues.data.password;
  const passwordHint = parsedValues.data.passwordHint;
  const shortenerBaseUrl = resolveShortenerBaseUrl();
  const domain = getDomainFromShortenerBaseUrl();
  const parsedShortenerBaseUrl = new URL(shortenerBaseUrl);

  debugSteps.push({
    name: 'shortener_config',
    status: 'ok',
    details: {
      destination: normalizedUrl.toString(),
      domain,
      shortenerBaseUrl,
    },
  });
  logShortenerDebug('short link config resolved', {
    destination: normalizedUrl.toString(),
    domain,
    shortenerBaseUrl,
  });

  if (normalizedUrl.origin === parsedShortenerBaseUrl.origin) {
    logShortenerDebugError('destination is already a shortener URL', {
      destination: normalizedUrl.toString(),
      shortenerOrigin: parsedShortenerBaseUrl.origin,
    });

    throw new Error(
      'Please enter a destination URL, not an existing short link'
    );
  }

  if (requestedSlug) {
    const parsedSlug = slugSchema.safeParse(requestedSlug);

    if (!parsedSlug.success) {
      logShortenerDebugError('custom slug validation failed', {
        issues: parsedSlug.error.issues.map((issue) => ({
          code: issue.code,
          message: issue.message,
          path: issue.path.join('.'),
        })),
        slug: requestedSlug,
      });

      throw new Error(
        parsedSlug.error.issues[0]?.message || 'Invalid custom slug'
      );
    }
  }

  if (passwordHint && !requestedPassword) {
    logShortenerDebugError('password hint provided without password', {
      passwordHint,
    });

    throw new Error('Add a password before adding a password hint');
  }

  const { supabase, user } = await requireAuthenticatedUser();
  const passwordHash = requestedPassword
    ? await bcrypt.hash(requestedPassword, 12)
    : null;

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
          password_hash: passwordHash,
          password_hint: passwordHash ? passwordHint || null : null,
          slug,
        },
      ])
      .select('id, link, slug, domain, creator_id, password_hash, created_at')
      .single();

    if (!error && data) {
      const createdLink = mapShortenedLink(data as ShortenedLinkRow);

      debugSteps.push({
        name: 'database_insert',
        status: 'ok',
        details: {
          id: createdLink.id,
          shortUrl: createdLink.shortUrl,
          slug: createdLink.slug,
        },
      });

      if (SHORTENER_DEBUG_ENABLED) {
        debugSteps.push(
          await checkShortLinkAccess(createdLink.shortUrl, createdLink.slug)
        );
        createdLink.debug = {
          enabled: true,
          steps: debugSteps,
        };
        logShortenerDebug('short link created', {
          debug: createdLink.debug,
          shortUrl: createdLink.shortUrl,
          slug: createdLink.slug,
        });
      }

      revalidatePath(SHORTENER_PAGE_PATH);
      return createdLink;
    }

    if (error?.code === '23505') {
      debugSteps.push({
        name: 'database_insert',
        status: 'warning',
        details: {
          attempt: attempt + 1,
          code: error.code,
          message: error.message,
          slug,
        },
      });
      logShortenerDebug('short link slug collision', {
        attempt: attempt + 1,
        message: error.message,
        slug,
      });

      if (requestedSlug) {
        throw new Error('That custom slug is already taken');
      }

      continue;
    }

    if (error?.message?.includes(SHORT_LINK_LIMIT_ERROR)) {
      logShortenerDebugError('short link limit reached', {
        message: error.message,
        userId: user.id,
      });

      throw new Error(SHORT_LINK_LIMIT_ERROR);
    }

    debugSteps.push({
      name: 'database_insert',
      status: 'error',
      details: {
        attempt: attempt + 1,
        code: error?.code,
        message: error?.message,
        slug,
      },
    });
    logShortenerDebugError('short link insert failed', {
      attempt: attempt + 1,
      debugSteps,
      error,
      slug,
    });
    console.error(error);
    throw new Error(
      SHORTENER_DEBUG_ENABLED && error?.message
        ? `Failed to create short link: ${error.message}`
        : 'Failed to create short link'
    );
  }

  throw new Error('Could not generate a unique short link after 10 attempts');
}

/**
 * Creates a short link from a URL string for dynamic QR code generation.
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
  // Dynamic QR destinations are stored in their own `dynamic_qr_links` table
  // so they do NOT count against the shortener's per-user 30-link limit. The
  // slug namespace is shared with `shortened_links` (a DB trigger enforces
  // cross-table uniqueness), so collisions still surface as errcode 23505 and
  // are retried below. Unlike short links, dynamic QR links have no limit,
  // custom slug, or password.
  const normalizedUrl = parseHttpUrl(url);

  const shortenerBaseUrl = resolveShortenerBaseUrl();
  const domain = getDomainFromShortenerBaseUrl();
  const parsedShortenerBaseUrl = new URL(shortenerBaseUrl);

  if (normalizedUrl.origin === parsedShortenerBaseUrl.origin) {
    throw new Error(
      'Please enter a destination URL, not an existing short link'
    );
  }

  const { supabase, user } = await requireAuthenticatedUser();

  for (let attempt = 0; attempt < 10; attempt++) {
    const slug = generateSlug();

    // `dynamic_qr_links` may not be in the generated Supabase types yet.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('dynamic_qr_links')
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
        shortUrl: `${shortenerBaseUrl}/${data.slug}`,
        slug: data.slug,
        createdAt: data.created_at,
        originalUrl: data.link,
      };
    }

    // Slug collision within either table — try a new slug.
    if (error?.code === '23505') {
      continue;
    }

    console.error(error);
    throw new Error(error?.message || 'Failed to create dynamic QR link');
  }

  throw new Error(
    'Could not generate a unique dynamic QR link after 10 attempts'
  );
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
    .from('dynamic_qr_links')
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
    .from('dynamic_qr_links')
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

/**
 * Fetches aggregated scan analytics for a dynamic QR code by slug.
 *
 * Ownership is enforced twice: the shortened_links lookup filters on
 * creator_id, and RLS on link_analytics restricts rows to the owner.
 *
 * @param slug - The slug returned by createDynamicQRUrl
 */
export async function getDynamicQRAnalytics(
  slug: string
): Promise<DynamicQRAnalytics> {
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
    throw new Error('Please sign in to view analytics for this link');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link, error: linkError } = await (supabase as any)
    .from('dynamic_qr_links')
    .select('id, slug, created_at')
    .eq('slug', parsedSlug.data)
    .eq('creator_id', user.id)
    .single();

  if (linkError || !link) {
    throw new Error('Short link not found or you do not have access to it');
  }

  const { data: rows, error: analyticsError } = await supabase
    .from('link_analytics')
    .select('created_at, device_type, country, city')
    .eq('link_id', link.id)
    .order('created_at', { ascending: false });

  if (analyticsError) {
    console.error(analyticsError);
    throw new Error('Failed to load analytics for this link');
  }

  const scans = (rows ?? []) as LinkAnalyticsRow[];

  return buildDynamicQRAnalytics({
    slug: link.slug,
    createdAt: link.created_at,
    rows: scans,
  });
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
    throw new Error('Failed to delete short link');
  }

  if (!data) {
    throw new Error('Short link not found or you do not have permission');
  }

  revalidatePath(SHORTENER_PAGE_PATH);

  return { deletedId: data.id };
}
