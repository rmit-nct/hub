import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

interface Params {
  params: {
    wsId: string;
    configId: string;
  };
}

export async function PUT(
  req: Request,
  { params: { wsId, configId: id } }: Params
) {
  const supabase = createClient();

  const { value } = await req.json();

  const { error } = await supabase
    .from('workspace_configs')
    .upsert({
      id,
      ws_id: wsId,
      value: value || '',
      updated_at: new Date().toISOString(),
    })
    .eq('ws_id', wsId)
    .eq('id', id);

  if (error) {
    console.log(error);
    return NextResponse.json(
      { message: 'Error upserting workspace config' },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'success' });
}
