import { createClient } from '@ncthub/supabase/next/server';
import { NextResponse } from 'next/server';

function isMissingSessionError(error: { message: string }) {
  const message = error.message.toLowerCase();
  return message.includes('session') && message.includes('missing');
}

export async function POST() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut({
    scope: 'local',
  });

  if (error) {
    if (isMissingSessionError(error)) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
