
import React from 'react';
import FinanceCard from '@/components/finance_component/financeCard';
import ToDoTasks from '@/components/finance_component/toDoCard';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSecrets } from '@/lib/workspace-helper';

export const dynamic = 'force-dynamic';

export default async function FinanceDashboard({
  params: { wsId },
}: {
  params: { wsId: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  const secrets = await getSecrets({
    wsId,
    requiredSecrets: ['ENABLE_FINANCE'],
    forceAdmin: true,
  });

  const verifySecret = (secret: string, value: string) =>
    secrets.find((s) => s.name === secret)?.value === value;

  const enableFinance = verifySecret('ENABLE_FINANCE', 'true');
  if (!enableFinance) {
    redirect(`/${wsId}`);
    return null;
  }

  const { data, error } = await supabase
    .from('to_do_tasks_finance')
    .select('*');

  if (error) {
    console.error('Error fetching data:', error);
    return (
      <div className="relative inline-block w-[800px] rounded-3xl bg-gray-800 p-6 text-center">
        <h2 className="justify-left mb-4 flex items-center text-3xl font-bold">
          To-do tasks: <span className="ml-2 ">🎯</span>
        </h2>
        <div className="text-white">Error fetching data</div>
      </div>
    );
  }

  console.log('Fetched tasks:', data);

  if (!data || data.length === 0) {
    return (
      <div className="relative inline-block w-[800px] rounded-3xl bg-gray-800 p-6 text-center">
        <h2 className="justify-left mb-4 flex items-center text-3xl font-bold">
          To-do tasks: <span className="ml-2 ">🎯</span>
        </h2>
        <div className="text-white">No tasks found</div>
      </div>
    );
  }

  const tasks = data;

  return (
    <div className="flex space-x-[270px]">
      <FinanceCard />
      <ToDoTasks wsId={wsId} tasks={tasks} />
    </div>
  );
}
