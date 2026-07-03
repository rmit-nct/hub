import { customAlphabet } from 'nanoid';
import { z } from 'zod';

export interface CreatedShortLink {
  createdAt: string;
  creatorId: string;
  debug?: ShortLinkDebugReport;
  domain: string;
  id: string;
  isPasswordProtected: boolean;
  link: string;
  shortUrl: string;
  slug: string;
}

export interface ShortLinkDebugStep {
  details?: Record<string, unknown>;
  name: string;
  status: 'error' | 'ok' | 'warning';
}

export interface ShortLinkDebugReport {
  enabled: boolean;
  steps: ShortLinkDebugStep[];
}

export interface DynamicQRMetadata {
  shortUrl: string;
  slug: string;
  createdAt: string;
  originalUrl: string;
}

export interface ShortLinksOverview {
  isAuthenticated: boolean;
  limit: number;
  remainingCount: number;
  usedCount: number;
  links: CreatedShortLink[];
}

export interface SlugAvailabilityResult {
  available: boolean;
  message: string;
  slug: string;
  status: 'available' | 'empty' | 'error' | 'invalid' | 'taken';
}

export type ShortenedLinkRow = {
  created_at: string;
  creator_id: string;
  domain: string;
  id: string;
  link: string;
  password_hash: string | null;
  slug: string;
};

export interface DynamicQRDeviceStat {
  type: string;
  count: number;
}

export interface DynamicQRLocationStat {
  country: string;
  city: string;
  count: number;
}

export interface DynamicQRRecentScan {
  scannedAt: string;
  deviceType: string;
  country: string;
  city: string;
}

export interface DynamicQRAnalytics {
  slug: string;
  createdAt: string;
  totalScans: number;
  lastScanAt: string | null;
  devices: DynamicQRDeviceStat[];
  locations: DynamicQRLocationStat[];
  recentScans: DynamicQRRecentScan[];
}

export type LinkAnalyticsRow = {
  created_at: string;
  device_type: string | null;
  country: string | null;
  city: string | null;
};

export const generateSlug = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  6
);

export const SHORT_LINK_LIMIT = 30;
export const SHORTENER_PAGE_PATH = '/neo-shortener';
export const DEFAULT_SHORTENER_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3002'
    : 'https://www.rmitnct.site';
export const SHORTENER_DEBUG_ENABLED =
  process.env.NEO_SHORTENER_DEBUG === 'true' ||
  process.env.SHORTENER_DEBUG === 'true';
export const SHORT_LINK_LIMIT_ERROR =
  'You have reached the 30-link limit for your account';

const RESERVED_SHORT_LINK_SLUGS = new Set([
  '_next',
  'api',
  'assets',
  'favicon',
  'robots',
  'sitemap',
]);

export const slugSchema = z
  .string()
  .trim()
  .min(3, 'Custom slug must be at least 3 characters')
  .max(32, 'Custom slug must be 32 characters or fewer')
  .regex(
    /^[a-zA-Z0-9\-_]+$/,
    'Custom slug can only contain letters, numbers, hyphens, and underscores'
  )
  .refine(
    (slug) => !RESERVED_SHORT_LINK_SLUGS.has(slug.toLowerCase()),
    'This custom slug is reserved'
  );

export const createShortLinkSchema = z.object({
  url: z.string().trim().min(1, 'URL is required'),
  customSlug: z.string().optional().default(''),
  password: z
    .string()
    .max(256, 'Password must be 256 characters or fewer')
    .optional()
    .default(''),
  passwordHint: z
    .string()
    .trim()
    .max(200, 'Password hint must be 200 characters or fewer')
    .optional()
    .default(''),
});

export const deleteShortLinkSchema = z.string().uuid('Invalid short link id');

function normalizeShortenerBaseUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new Error('Shortener base URL is not configured correctly');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Shortener base URL must use HTTP or HTTPS');
  }

  return url.toString().replace(/\/$/, '');
}

export function resolveShortenerBaseUrl() {
  return normalizeShortenerBaseUrl(
    process.env.NEXT_PUBLIC_SHORTENER_URL ||
      process.env.SHORTENER_APP_URL ||
      DEFAULT_SHORTENER_BASE_URL
  );
}

function hasExplicitScheme(value: string) {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value);
}

export function parseHttpUrl(value: string) {
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

  if (isBlockedDestinationHost(url.hostname)) {
    throw new Error('Local or private URLs cannot be shortened');
  }

  return url;
}

function isBlockedDestinationHost(hostname: string) {
  if (process.env.NODE_ENV === 'development') {
    return false;
  }

  const normalizedHostname = hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, '')
    .replace(/\.$/, '');

  if (
    normalizedHostname === 'localhost' ||
    normalizedHostname.endsWith('.localhost') ||
    normalizedHostname.endsWith('.local')
  ) {
    return true;
  }

  const isIpv6Address = normalizedHostname.includes(':');

  if (
    isIpv6Address &&
    (normalizedHostname === '::1' ||
      normalizedHostname.startsWith('fc') ||
      normalizedHostname.startsWith('fd') ||
      normalizedHostname.startsWith('fe80:'))
  ) {
    return true;
  }

  const ipv4Parts = normalizedHostname.split('.').map(Number);

  if (
    ipv4Parts.length !== 4 ||
    ipv4Parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return false;
  }

  const first = ipv4Parts[0] ?? -1;
  const second = ipv4Parts[1] ?? -1;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

export function getDomainFromShortenerBaseUrl() {
  try {
    return new URL(resolveShortenerBaseUrl()).host;
  } catch {
    return new URL(DEFAULT_SHORTENER_BASE_URL).host;
  }
}

export function logShortenerDebug(
  message: string,
  details?: Record<string, unknown>
) {
  if (!SHORTENER_DEBUG_ENABLED) return;

  console.info('[neo-shortener-debug]', message, details ?? {});
}

export function logShortenerDebugError(
  message: string,
  details?: Record<string, unknown>
) {
  if (!SHORTENER_DEBUG_ENABLED) return;

  console.error('[neo-shortener-debug]', message, details ?? {});
}

export async function checkShortLinkAccess(
  shortUrl: string,
  slug: string
): Promise<ShortLinkDebugStep> {
  const debugUrl = new URL(shortUrl);
  debugUrl.searchParams.set('debug', '1');

  try {
    const response = await fetch(debugUrl.toString(), {
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(8000),
    });

    const location = response.headers.get('location');
    const step: ShortLinkDebugStep = {
      name: 'short_link_access_check',
      status: response.ok || response.status < 400 ? 'ok' : 'warning',
      details: {
        location,
        shortUrl,
        slug,
        status: response.status,
        statusText: response.statusText,
      },
    };

    if (step.status === 'warning') {
      logShortenerDebugError('short link access check returned non-ok status', {
        location,
        shortUrl,
        slug,
        status: response.status,
        statusText: response.statusText,
      });
    } else {
      logShortenerDebug('short link access check passed', {
        location,
        shortUrl,
        slug,
        status: response.status,
        statusText: response.statusText,
      });
    }

    return step;
  } catch (error) {
    logShortenerDebugError('short link access check failed', {
      error: error instanceof Error ? error.message : String(error),
      shortUrl,
      slug,
    });

    return {
      name: 'short_link_access_check',
      status: 'error',
      details: {
        error: error instanceof Error ? error.message : String(error),
        shortUrl,
        slug,
      },
    };
  }
}

export function mapShortenedLink(
  row: ShortenedLinkRow,
  debug?: ShortLinkDebugReport
): CreatedShortLink {
  const shortenerBaseUrl = resolveShortenerBaseUrl();

  return {
    createdAt: row.created_at,
    creatorId: row.creator_id,
    debug,
    domain: row.domain,
    id: row.id,
    isPasswordProtected: Boolean(row.password_hash),
    link: row.link,
    shortUrl: `${shortenerBaseUrl}/${row.slug}`,
    slug: row.slug,
  };
}

export function buildDynamicQRAnalytics({
  createdAt,
  rows,
  slug,
}: {
  createdAt: string;
  rows: LinkAnalyticsRow[];
  slug: string;
}): DynamicQRAnalytics {
  const deviceCounts = new Map<string, number>();
  const locationCounts = new Map<
    string,
    { country: string; city: string; count: number }
  >();

  for (const scan of rows) {
    const device = scan.device_type || 'unknown';
    deviceCounts.set(device, (deviceCounts.get(device) ?? 0) + 1);

    const country = scan.country || 'Unknown';
    const city = scan.city || '';
    const key = `${country}|${city}`;
    const existing = locationCounts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      locationCounts.set(key, { country, city, count: 1 });
    }
  }

  const devices = Array.from(deviceCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const locations = Array.from(locationCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentScans = rows.slice(0, 10).map((scan) => ({
    scannedAt: scan.created_at,
    deviceType: scan.device_type || 'unknown',
    country: scan.country || 'Unknown',
    city: scan.city || '',
  }));

  return {
    slug,
    createdAt,
    totalScans: rows.length,
    lastScanAt: rows[0]?.created_at ?? null,
    devices,
    locations,
    recentScans,
  };
}
