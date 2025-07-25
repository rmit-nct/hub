import StatisticCard from '@/components/cards/StatisticCard';
import { getPermissions } from '@/lib/workspace-helper';
import { createClient } from '@ncthub/supabase/next/server';
import { getTranslations } from 'next-intl/server';

export default async function UserGroupTagsStatistics({
  wsId,
}: {
  wsId: string;
  redirect?: boolean;
}) {
  const supabase = await createClient();
  const t = await getTranslations();

  const enabled = true;

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
