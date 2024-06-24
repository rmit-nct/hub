import React from 'react';
import BillDataTable from '@/components/finance_component/billTrackingComponent';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSecrets } from '@/lib/workspace-helper';

export const dynamic = 'force-dynamic';

export default async function App({
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

  const { data: tasksData, error: tasksError } = await supabase
    .from('to_do_tasks_finance')
    .select('*');

  if (tasksError) {
    console.error('Error fetching tasks data:', tasksError);
  }

  const { data: billTrackingData, error: billTrackingError } = await supabase
    .from('bill_tracking')
    .select(`
      *,
      workspace_users:member_in_charge (
        full_name,
        email,
        id
      ),
      finance_bill_items (
        *,
        finance_items:item_id (
          item_name,
          item_price,
          item_description
        )
      )
    `);

  if (billTrackingError) {
    console.error('Error fetching bill tracking data:', billTrackingError);
  } else if (!billTrackingData) {
    console.warn('No bill tracking data found');
  }

  // Transform billTrackingData to include user_name at the top level
  const transformedBillTrackingData = billTrackingData?.map((item: any) => ({
    ...item,
    user_name: item.workspace_users ? item.workspace_users.full_name : "Unknown",
    items: item.finance_bill_items.map((billItem: any) => ({
      id: billItem.id,
      created_at: billItem.created_at,
      item_name: billItem.finance_items.item_name,
      item_price: billItem.finance_items.item_price,
      item_description: billItem.finance_items.item_description
    })),
  })) || [];

  console.log('Fetched tasks:', tasksData);
  console.log('Fetched bill tracking:', transformedBillTrackingData);

  return (
    <div className="App">
      <h1 className="text-3xl font-bold mb-8">Bill tracking</h1>
      <BillDataTable
        tasks={tasksData || []}
        bills={transformedBillTrackingData}
        wsId={wsId}
      />
    </div>
  );
}
