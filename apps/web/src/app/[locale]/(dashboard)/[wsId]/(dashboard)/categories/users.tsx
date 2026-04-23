import { getTranslations } from 'next-intl/server';
import { getPermissions } from '@/lib/workspace-helper';

export async function UsersCategoryStatistics({ wsId }: { wsId: string }) {
  const t = await getTranslations();
  const enabled = true;

  const { permissions } = await getPermissions({
    wsId,
  });

  if (!enabled || !permissions.includes('manage_users')) return null;

  return (
    <div className="mt-4 mb-2 font-semibold text-2xl">
      {t('sidebar_tabs.users')}
    </div>
  );
}
