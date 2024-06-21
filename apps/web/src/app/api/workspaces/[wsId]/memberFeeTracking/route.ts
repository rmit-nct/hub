import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

interface Params {
  params: {
    wsId: string;
  };
}


export async function POST(req: NextRequest, {params: {}} :Params){
    const supabase= createServerComponentClient({cookies});

    const {memberFee} = await req.json();

    let response;

    response= await supabase.from("member_fee_tracking").update(memberFee).eq("id",memberFee.id);


    const {data,error} =response;

    if(error){
        return NextResponse.json({error:error.message}, {status: 500});
    }

    return NextResponse.json({data});
}