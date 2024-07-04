import { createAdminClient, createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

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

  const apiCheckQuery = sbAdmin
    .from('workspace_api_keys')
    .select('id')
    .eq('ws_id', wsId)
    .eq('value', apiKey)
    .single();

  const mainQuery = sbAdmin
    .from('wallet_transactions')
    .select('amount.sum(), workspace_wallets!inner(ws_id)')
    .eq('workspace_wallets.ws_id', wsId)
    .lt('amount', 0)
    .maybeSingle();

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
      { message: 'Error fetching workspace API configs' },
      { status: 500 }
    );
  }

  // @ts-expect-error
  return NextResponse.json(data?.sum || 0);
}

async function getDataFromSession({ wsId }: { wsId: string }) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('amount.sum(), workspace_wallets!inner(ws_id)')
    .eq('workspace_wallets.ws_id', wsId)
    .lt('amount', 0)
    .maybeSingle();

  if (error) {
    console.log(error);
    return NextResponse.json(
      { message: 'Error fetching workspace API configs' },
      { status: 500 }
    );
  }

  // @ts-expect-error
  return NextResponse.json(data?.sum || 0);
}
