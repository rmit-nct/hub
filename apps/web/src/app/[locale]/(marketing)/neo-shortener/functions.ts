'use server';

import { createClient } from '@ncthub/supabase/next/server';
import { createAdminClient } from '@ncthub/supabase/next/server';

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function encodeUuidToBase62(uuid: string): string {
  const hex = uuid.replace(/-/g, '');

  if (!/^[0-9a-fA-F]{32}$/.test(hex)) {
    throw new Error('Invalid UUID');
  }

  let n = BigInt(`0x${hex}`);

  if (n === 0n) return '0';

  let result = '';

  while (n > 0n) {
    const remainder = Number(n % 62n);
    result = BASE62[remainder] + result;
    n = n / 62n;
  }

  return result;
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function createShortLink(formData: FormData) {
  const rawUrl = formData.get('url');

  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('URL is required');
  }

  const link = rawUrl.trim();

  if (!isValidHttpUrl(link)) {
    throw new Error('Please enter a valid URL');
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const sbAdmin = await createAdminClient();

  const tempSlug = `tmp-${crypto.randomUUID()}`;

  const { data: inserted, error: insertError } = await sbAdmin
    .from('shortened_links')
    .insert([
      {
        link,
        slug: tempSlug,
        domain: '',
        creator_id: user.id,
      },
    ])
    .select('id')
    .single();

  if (insertError || !inserted) {
    console.error(insertError);
    throw new Error(insertError?.message || 'Failed to insert link');
  }

  const slug = encodeUuidToBase62(inserted.id);

  const { data: updated, error: updateError } = await sbAdmin
    .from('shortened_links')
    .update({ slug })
    .eq('id', inserted.id)
    .select('id, link, slug')
    .single();

  if (updateError || !updated) {
    console.error(updateError);
    throw new Error(updateError?.message || 'Failed to update slug');
  }

  return updated;
}