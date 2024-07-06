import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

interface Params {
  params: {
    roleId: string;
  };
}

export async function GET(_: Request, { params: { roleId } }: Params) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('workspace_role_members')
    .select('*', {
      count: 'exact',
    })
    .eq('role_id', roleId);

  if (error) {
    console.log(error);
    return NextResponse.json(
      { message: 'Error fetching role members' },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(req: Request, { params: { roleId } }: Params) {
  const supabase = createClient();

  const data = (await req.json()) as {
    memberIds: string[];
  };

  if (!data?.memberIds)
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });

  const { error: roleError } = await supabase
    .from('workspace_role_members')
    .insert(
      data.memberIds.map((memberId) => ({
        user_id: memberId,
        role_id: roleId,
      }))
    );

  if (roleError) {
    console.log(roleError);
    return NextResponse.json(
      { message: 'Error adding new members to role' },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'success' });
}
