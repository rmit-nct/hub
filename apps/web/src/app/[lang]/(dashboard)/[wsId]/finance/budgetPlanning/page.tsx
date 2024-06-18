import React from 'react';
import BudgetPlanning from '@/components/finance_component/budgetPlanning';
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

    const {data: tasksData,error: errorData} = await supabase
      .from('to_do_tasks_finance')
      .select('*');


      if(errorData){
        console.log("Error fetching data");
      }

      console.log('Fetched tasks', tasksData);

      const {data: event, error :eventError}= await supabase
        .from('budget_planning')
        .select('*');

        if(eventError){
          console.log("Error fetching event data");
        }else{
          console.log('Data fetched: ' + event);
        }
  return (
    <div className="App">

        <h1 className='text-3xl font-bold mb-8'>Budget Planning</h1>
        <BudgetPlanning events={event || []} tasks={tasksData || []} wsId={wsId}></BudgetPlanning>
    </div>
  );
}



