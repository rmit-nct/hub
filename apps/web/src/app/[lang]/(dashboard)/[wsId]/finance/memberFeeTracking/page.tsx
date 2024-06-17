import React from 'react';
import MemberFeeTracking from '@/components/finance_component/memberFeeComponent';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSecrets } from '@/lib/workspace-helper';

export const dynamic ='force-dynamic';


export default async function App({
  params: {wsId},
}:{
  params: {wsId: string};
}){

  const supabase = createServerComponentClient({cookies});

  const secrets= await getSecrets({
    wsId,
    requiredSecrets: ['ENABLE_FINANCE'],
    forceAdmin: true,
  });

  const verifySecret = (secret: string, value: string)=>
    secrets.find((s) => s.name === secret)?.value=== value;


    const enableFinance = verifySecret('ENABLE_FINANCE', 'true');
    if (!enableFinance) {
      redirect(`/${wsId}`);
      return null;
    }

    const {data,error} = await supabase
      .from('to_do_tasks_finance')
      .select('*');


      if(error){
        console.log("Error fetching data");
      }

      console.log('Fetched tasks', data);
  return (
    <div className="App">
       <h1 className="text-3xl font-bold mb-8">Member fee tracking</h1>
      <MemberFeeTracking tasks={data || []} wsId={wsId}></MemberFeeTracking>
      </div>
  );
}

