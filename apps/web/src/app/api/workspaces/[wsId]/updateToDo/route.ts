import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic= 'force-dynamic';
interface Params {
  params: {
    wsId: string;
  };
}
export async function POST(req: NextRequest, { params: {wsId :id} }: Params) {
  const supabase = createServerComponentClient({ cookies });
  // const { wsId } = params;
  console.log(id);
  const { taskId, updates } = await req.json();

  const { data, error } = await supabase
    .from('to_do_tasks_finance')
    .update(updates)
    .eq('id', taskId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
