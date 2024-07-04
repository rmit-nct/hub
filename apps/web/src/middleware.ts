import { Locales, defaultLocale, locales } from './config';
import { LOCALE_COOKIE_NAME } from './constants/common';
import { updateSession } from './utils/supabase/middleware';
import { match } from '@formatjs/intl-localematcher';
import { User } from '@supabase/supabase-js';
import Negotiator from 'negotiator';
import createIntlMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest): Promise<NextResponse> {
  // Make sure user session is always refreshed
  const { res, user } = await updateSession(req);

  // If current path starts with /api, return without redirecting
  if (req.nextUrl.pathname.startsWith('/api')) return res;

  // Handle special cases for public paths
  const { res: nextRes, redirect } = handleRedirect({ req, res, user });
  if (redirect) return nextRes;

  return handleLocale({ req, res: nextRes });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (SEO)
     * - sitemap.xml (SEO)
     * - site.webmanifest (SEO)
     * - monitoring (analytics)
     * Excludes files with the following extensions for static assets:
     * - svg
     * - png
     * - jpg
     * - jpeg
     * - gif
     * - webp
     */

    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|site.webmanifest|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

const PUBLIC_PATHS = [
  '/terms',
  '/privacy',
  '/branding',
  '/ai/chats',
  '/calendar/meet-together',
].reduce((acc: string[], path) => {
  // Add the original path
  acc.push(path);

  // Add localized paths
  const localizedPaths = locales.map((locale) => `/${locale}${path}`);
  acc.push(...localizedPaths);

  return acc;
}, []);

const handleRedirect = ({
  req,
  res,
  user,
}: {
  req: NextRequest;
  res: NextResponse;
  user: User | null;
}): {
  res: NextResponse;
  redirect: boolean;
} => {
  // If current path ends with /login and user is logged in, redirect to onboarding page
  if (req.nextUrl.pathname.endsWith('/login') && user) {
    const nextRes = NextResponse.redirect(
      req.nextUrl.href.replace('/login', '/onboarding')
    );

    return { res: nextRes, redirect: true };
  }

  // If current path ends with /onboarding and user is not logged in, redirect to login page
  if (
    req.nextUrl.pathname !== '/' &&
    !req.nextUrl.pathname.endsWith('/login') &&
    !PUBLIC_PATHS.some((path) => req.nextUrl.pathname.startsWith(path)) &&
    !user
  ) {
    const nextRes = NextResponse.redirect(
      req.nextUrl.href.replace(req.nextUrl.pathname, '/login') +
        `?nextUrl=${req.nextUrl.pathname}`
    );

    return { res: nextRes, redirect: true };
  }

  return { res, redirect: false };
};

const getSupportedLocale = (locale: string): Locales | null => {
  return locales.includes(locale as any) ? (locale as Locales) : null;
};

const getExistingLocale = (
  req: NextRequest
): {
  locale: Locales | null;
  cookie: string | null;
  pathname: string | null;
} => {
  // Get raw locale from pathname and cookie
  const rawLocaleFromPathname = req.nextUrl.pathname.split('/')[1] || '';
  const rawRocaleFromCookie = req.cookies.get(LOCALE_COOKIE_NAME)?.value || '';

  // Get supported locale from pathname and cookie
  const localeFromPathname = getSupportedLocale(rawLocaleFromPathname);
  const localeFromCookie = getSupportedLocale(rawRocaleFromCookie);

  const locale = localeFromPathname || localeFromCookie;

  return {
    locale,
    cookie: localeFromCookie,
    pathname: localeFromPathname,
  };
};

const getDefaultLocale = (
  req: NextRequest
): {
  locale: Locales;
} => {
  // Get browser languages
  const headers = {
    'accept-language': req.headers.get('accept-language') ?? 'en-US,en;q=0.5',
  };

  const languages = new Negotiator({ headers }).languages();
  const detectedLocale = match(languages, locales, defaultLocale);

  return {
    locale: locales.includes(detectedLocale as any)
      ? (detectedLocale as Locales)
      : defaultLocale,
  };
};

const getLocale = (
  req: NextRequest
): {
  locale: string;
  cookie: string | null;
  pathname: string | null;
  default: boolean;
} => {
  // Get locale from pathname and cookie
  const { locale: existingLocale, cookie, pathname } = getExistingLocale(req);

  // If locale is found, return it
  if (existingLocale) {
    return {
      locale: existingLocale,
      cookie,
      pathname,
      default: false,
    };
  }

  // If locale is not found, return default locale
  const { locale: defaultLocale } = getDefaultLocale(req);

  return {
    locale: defaultLocale,
    cookie,
    pathname,
    default: true,
  };
};

const handleLocale = ({
  req,
  res,
}: {
  req: NextRequest;
  res: NextResponse;
}): NextResponse => {
  // Get locale from cookie or browser languages
  const { locale, pathname } = getLocale(req);

  // Construct nextUrl with locale and redirect
  req.nextUrl.pathname = !pathname
    ? `/${locale}${req.nextUrl.pathname}`
    : req.nextUrl.pathname.replace(pathname, locale);

  NextResponse.rewrite(req.nextUrl, res);

  const nextIntlMiddleware = createIntlMiddleware({
    locales,
    defaultLocale: locale as Locales,
    localeDetection: false,
  });

  return nextIntlMiddleware(req);
};
