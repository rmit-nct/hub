import StatisticCard from '@/components/cards/StatisticCard';
import { createClient } from '@/utils/supabase/server';
import { getTranslations } from 'next-intl/server';

const enabled = true;

export default async function WalletsStatistics({ wsId }: { wsId: string }) {
  const supabase = createClient();
  const t = await getTranslations();

  const { count: walletsCount } = enabled
    ? await supabase
        .from('workspace_wallets')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .eq('ws_id', wsId)
    : { count: 0 };

  if (!enabled) return null;

  return (
    <StatisticCard
      title={t('workspace-finance-tabs.wallets')}
      value={walletsCount}
      href={`/${wsId}/finance/wallets`}
    />
  );
}
