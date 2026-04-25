import { nanoid } from 'nanoid';

/**
 * Validates if a string is a public HTTP(S) URL.
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }

    return !isBlockedDestinationHost(parsedUrl.hostname);
  } catch {
    return false;
  }
}

function isBlockedDestinationHost(hostname: string): boolean {
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

/**
 * Validates if a string is a valid slug (alphanumeric, hyphens, underscores only)
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-zA-Z0-9\-_]+$/.test(slug);
}

/**
 * Generates a random URL-safe slug
 */
export function generateSlug(length = 6): string {
  return nanoid(length);
}

/**
 * Normalizes a URL by trimming whitespace and ensuring it has a protocol
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();

  // Add https:// if no protocol is specified
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }

  return trimmed;
}
