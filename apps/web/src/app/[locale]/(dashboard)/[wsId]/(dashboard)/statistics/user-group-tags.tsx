import StatisticCard from '@/components/cards/StatisticCard';
import { getPermissions, verifyHasSecrets } from '@/lib/workspace-helper';
import { createClient } from '@/utils/supabase/server';
import { getTranslations } from 'next-intl/server';

export default async function UserGroupTagsStatistics({
  wsId,
  redirect = false,
}: {
  wsId: string;
  redirect?: boolean;
}) {
  const supabase = createClient();
  const t = await getTranslations();

  const enabled = await verifyHasSecrets(
    wsId,
    ['ENABLE_USERS'],
    redirect ? `/${wsId}` : undefined
  );

  const { count: userGroups } = enabled
    ? await supabase
        .from('workspace_user_group_tags')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .eq('ws_id', wsId)
    : { count: 0 };

  const { permissions } = await getPermissions({
    wsId,
    requiredPermissions: [
      'ai_chat',
      'ai_lab',
      'manage_calendar',
      'manage_projects',
      'manage_documents',
      'manage_drive',
      'manage_users',
      'manage_inventory',
      'manage_finance',
    ],
  });

  if (!enabled || !permissions.includes('manage_users')) return null;

  return (
    <StatisticCard
      title={t('workspace-users-tabs.group_tags')}
      value={userGroups}
      href={`/${wsId}/users/group-tags`}
    />
  );
}
