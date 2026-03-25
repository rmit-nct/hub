'use server';

import { createAdminClient, createClient } from '@ncthub/supabase/next/server';
import { customAlphabet } from 'nanoid';

const generateSlug = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  5
);

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
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error(userError);
    throw new Error(userError.message || 'Failed to get authenticated user');
  }

  if (!user) {
    throw new Error('User not authenticated');
  }

  const sbAdmin = await createAdminClient();

  for (let attempt = 0; attempt < 10; attempt++) {
    const slug = generateSlug();

    const { data, error } = await sbAdmin
      .from('shortened_links')
      .insert([
        {
          link,
          slug,
          domain: '',
          creator_id: user.id,
        },
      ])
      .select('id, link, slug')
      .single();

    if (!error && data) {
      return data;
    }

    // PostgreSQL unique constraint violation
    if (error?.code === '23505') {
      continue;
    }

    console.error(error);
    throw new Error(error?.message || 'Failed to create short link');
  }

  throw new Error('Could not generate a unique short link after 10 attempts');
}
