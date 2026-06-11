import { createAdminClient } from '@ncthub/supabase/next/server';
import bcrypt from 'bcrypt';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { trackLinkClick } from '@/lib/analytics';
import { isValidUrl } from '@/lib/utils';

const verifySchema = z.object({
  linkId: z.string().uuid(),
  password: z.string().min(1).max(256),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9\-_]+$/)
    .optional(),
});

/**
 * POST handler for verifying password-protected links.
 *
 * @param {NextRequest} request - The incoming request containing link context and password.
 * @returns {Promise<NextResponse>} A JSON response with the destination URL or an error message.
 *
 * @example
 * // Request body
 * {
 *   "linkId": "uuid-here",
 *   "password": "plain-text-password",
 *   "slug": "optional-slug"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = verifySchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    const { linkId, slug, password } = result.data;

    const sbAdmin = await createAdminClient();

    let query = sbAdmin
      .from('shortened_links')
      .select('id, link, password_hash, slug')
      .eq('id', linkId);

    if (slug) {
      query = query.eq('slug', slug);
    }

    const { data: link, error: fetchError } = await query.maybeSingle();

    if (fetchError || !link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    if (!isValidUrl(link.link)) {
      return NextResponse.json(
        { error: 'This short link is no longer available' },
        { status: 410 }
      );
    }

    if (!link.password_hash) {
      return NextResponse.json({ url: link.link });
    }

    const isValidPassword = await bcrypt.compare(password, link.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Incorrect password. Please try again.' },
        { status: 403 }
      );
    }

    await trackLinkClick(link.id, link.slug);

    return NextResponse.json({ url: link.link, success: true });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
