import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

interface Params {
  params: {
    wsId: string;
  };
}

export async function POST(req: NextRequest, { params: {} }: Params) {
  const supabase = createServerComponentClient({ cookies });

  const { isCreate, event,userID } = await req.json();
  const budget_plan= {
    id: event.id,
    created_at: event.created_at,
    name: event.name,
    week: event.week,
    amount: event.number,
    assigned_to: userID

  }
    

  let response;
  if (isCreate) {
    response = await supabase.from("budget_planning").insert([budget_plan]).single();
  } else {
    response = await supabase.from("budget_planning").update(budget_plan).eq("id", event.id);
  }

  const { data, error } = response;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
