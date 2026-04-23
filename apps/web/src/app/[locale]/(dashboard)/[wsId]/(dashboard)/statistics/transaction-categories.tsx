import { createClient } from '@ncthub/supabase/next/server';
import { getTranslations } from 'next-intl/server';
import StatisticCard from '@/components/cards/StatisticCard';
import { getPermissions } from '@/lib/workspace-helper';
import type { FinanceDashboardSearchParams } from '../../finance/(dashboard)/page';

const enabled = true;

export default async function TransactionCategoriesStatistics({
  wsId,
  searchParams: { showFinanceStats = true } = {},
}: {
  wsId: string;
  searchParams?: FinanceDashboardSearchParams;
}) {
  const supabase = await createClient();
  const t = await getTranslations();

  const { count: categoriesCount } = enabled
    ? await supabase
        .from('transaction_categories')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .eq('ws_id', wsId)
    : { count: 0 };

  const { permissions } = await getPermissions({
    wsId,
  });

  if (!enabled || !permissions.includes('manage_finance')) return null;

  return (
    <StatisticCard
      title={t('workspace-finance-tabs.categories')}
      value={showFinanceStats ? categoriesCount : '***'}
      href={`/${wsId}/finance/transactions/categories`}
    />
  );
}
