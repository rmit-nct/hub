import { getTranslations } from 'next-intl/server';
import { getPermissions, verifyHasSecrets } from '@/lib/workspace-helper';

export async function FinanceCategoryStatistics({ wsId }: { wsId: string }) {
  const t = await getTranslations();

  const forceEnable = true;
  const enabled =
    forceEnable || (await verifyHasSecrets(wsId, ['ENABLE_FINANCE']));

  const { permissions } = await getPermissions({
    wsId,
  });

  if (!enabled || !permissions.includes('manage_finance')) return null;

  return (
    <div className="my-2 font-semibold text-2xl">
      {t('sidebar_tabs.finance')}
    </div>
  );
}
