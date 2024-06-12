import StatisticCard from '@/components/cards/StatisticCard';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import useTranslation from 'next-translate/useTranslation';
import { cookies } from 'next/headers';

const enabled = true;

export default async function ExpenseStatistics({ wsId }: { wsId: string }) {
  const supabase = createServerComponentClient({ cookies });
  const { t } = useTranslation();

  const { data: expense } = enabled
    ? await supabase.rpc('get_workspace_wallets_expense', {
        ws_id: wsId,
        start_date: null,
        end_date: null,
      })
    : { data: 0 };

  if (!enabled) return null;

  return (
    <StatisticCard
      title={t('finance-overview:total-expense')}
      value={Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        signDisplay: 'exceptZero',
      }).format(expense || 0)}
    />
  );
}
