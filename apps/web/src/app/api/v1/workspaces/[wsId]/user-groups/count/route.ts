import { createAdminClient } from '@/utils/supabase/client';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface Params {
  params: {
    wsId: string;
  };
}

export async function GET(_: Request, { params: { wsId } }: Params) {
  const apiKey = headers().get('API_KEY');
  return apiKey
    ? getDataWithApiKey({ wsId, apiKey })
    : getDataFromSession({ wsId });
}

async function getDataWithApiKey({
  wsId,
  apiKey,
}: {
  wsId: string;
  apiKey: string;
}) {
  const sbAdmin = createAdminClient();
  if (!sbAdmin)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );

  const apiCheckQuery = sbAdmin
    .from('workspace_api_keys')
    .select('id')
    .eq('ws_id', wsId)
    .eq('value', apiKey)
    .single();

  const mainQuery = sbAdmin
    .from('workspace_user_groups')
    .select('count()')
    .eq('ws_id', wsId)
    .single();

  const [apiCheck, response] = await Promise.all([apiCheckQuery, mainQuery]);

  const { error: apiError } = apiCheck;

  if (apiError) {
    console.log(apiError);
    return NextResponse.json({ message: 'Invalid API key' }, { status: 401 });
  }

  const { data, error } = response;

  if (error) {
    console.log(error);
    return NextResponse.json(
      { message: 'Error fetching workspace users' },
      { status: 500 }
    );
  }

  // @ts-expect-error: Supabase types don't support count() yet
  return NextResponse.json(data?.count || 0);
}

async function getDataFromSession({ wsId }: { wsId: string }) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data, error } = await supabase
    .from('workspace_user_groups')
    .select('count()')
    .eq('ws_id', wsId)
    .single();

  if (error) {
    console.log(error);
    return NextResponse.json(
      { message: 'Error fetching workspace users' },
      { status: 500 }
    );
  }

  // @ts-expect-error: Supabase types don't support count() yet
  return NextResponse.json(data?.count || 0);
}
