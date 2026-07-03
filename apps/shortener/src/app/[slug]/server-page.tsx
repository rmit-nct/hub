import { createAdminClient } from '@ncthub/supabase/next/server';
import { notFound, redirect } from 'next/navigation';
import { after } from 'next/server';
import { trackLinkClick } from '@/lib/analytics';
import { isValidUrl } from '@/lib/utils';
import PasswordForm from './password-form';

export default async function ServerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseHost = supabaseUrl
    ? new URL(supabaseUrl).host
    : 'missing-supabase-url';
  const hasServiceKey = Boolean(
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let shortenedLink: {
    id: string;
    link: string;
    password_hash: string | null;
    password_hint: string | null;
  } | null = null;

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

  if (!shortenedLink) {
    notFound();
  }

  if (!isValidUrl(shortenedLink.link)) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#121321] px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.16),_transparent_26%),radial-gradient(circle_at_bottom,_rgba(119,224,255,0.08),_transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:72px_72px]" />

        <div className="relative mx-auto flex max-w-md items-center justify-center pt-[18svh]">
          <div className="w-full rounded-[2rem] border border-white/10 bg-white/6 p-8 text-center shadow-[0_24px_80px_rgba(2,8,23,0.45)] backdrop-blur-xl">
            <div className="mx-auto mb-5 inline-flex rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 font-medium text-[11px] text-rose-200/90 uppercase tracking-[0.28em]">
              Link Error
            </div>
            <h1 className="mb-4 font-semibold text-3xl text-rose-100">
              Invalid URL
            </h1>
            <p className="mb-8 text-white/68 leading-relaxed">
              The shortened link you're looking for is invalid.
            </p>
            <a
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 font-semibold text-white transition-colors hover:bg-white/14 focus:outline-none focus:ring-4 focus:ring-white/10"
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If password protected, show password form instead of redirecting
  if (shortenedLink.password_hash) {
    return (
      <PasswordForm
        linkId={shortenedLink.id}
        slug={slug}
        hint={shortenedLink.password_hint}
      />
    );
  }

  // Schedule analytics after the response so redirects stay fast.
  after(async () => {
    await trackLinkClick(shortenedLink.id, slug);
  });

  redirect(shortenedLink.link);
}
