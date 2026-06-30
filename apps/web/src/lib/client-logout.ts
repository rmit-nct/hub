'use client';

import { createClient } from '@ncthub/supabase/next/client';

export async function logoutFromClient() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    cache: 'no-store',
    credentials: 'same-origin',
  }).catch(() => undefined);

  const supabase = createClient();
  const { error } = await supabase.auth.signOut({
    scope: 'local',
  });

  if (error) {
    throw error;
  }
}
