import InviteMemberButton from './_components/invite-member-button';
import MemberList from './_components/member-list';
import MemberTabs from './_components/member-tabs';
import { getCurrentUser } from '@/lib/user-helper';
import { getWorkspace, verifyHasSecrets } from '@/lib/workspace-helper';
import { User } from '@/types/primitives/User';
import { createAdminClient, createClient } from '@/utils/supabase/server';
import { Separator } from '@repo/ui/components/ui/separator';
import { getTranslations } from 'next-intl/server';

interface Props {
  params: {
    wsId: string;
  };
  searchParams: {
    status: string;
    roles: string;
  };
}

export default async function WorkspaceMembersPage({
  params: { wsId },
  searchParams,
}: Props) {
  const ws = await getWorkspace(wsId);
  const user = await getCurrentUser();
  const members = await getMembers(wsId, searchParams);

  const t = await getTranslations();
  const disableInvite = await verifyHasSecrets(wsId, ['DISABLE_INVITE']);

  return (
    <>
      <div className="border-border bg-foreground/5 flex flex-col justify-between gap-4 rounded-lg border p-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold">
            {t('workspace-settings-layout.members')}
          </h1>
          <p className="text-foreground/80">{t('ws-members.description')}</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 md:flex-row">
          <MemberTabs value={searchParams?.status || 'all'} />
          <InviteMemberButton
            wsId={wsId}
            currentUser={{
              ...user!,
              role: ws?.role,
            }}
            label={
              disableInvite
                ? t('ws-members.invite_member_disabled')
                : t('ws-members.invite_member')
            }
            disabled={disableInvite}
          />
        </div>
      </div>
      <Separator className="my-4" />

      <div className="flex min-h-full w-full flex-col">
        <div className="grid items-end gap-4 lg:grid-cols-2">
          <MemberList
            workspace={ws}
            members={members}
            invited={searchParams?.status === 'invited'}
          />
        </div>
      </div>
    </>
  );
}

const getMembers = async (
  wsId: string,
  { status, roles }: { status: string; roles: string }
) => {
  const supabase = createClient();
  const sbAdmin = createAdminClient();

  const { data: secretData, error: secretError } = await sbAdmin
    .from('workspace_secrets')
    .select('name')
    .eq('ws_id', wsId)
    .in('name', ['HIDE_MEMBER_EMAIL', 'HIDE_MEMBER_NAME'])
    .eq('value', 'true');

  if (secretError) throw secretError;

  const queryBuilder = supabase
    .from('workspace_members_and_invites')
    .select(
      'id, handle, email, display_name, avatar_url, pending, role, role_title, created_at',
      {
        count: 'exact',
      }
    )
    .eq('ws_id', wsId)
    .order('pending')
    .order('created_at', { ascending: false })
    .order('id', { ascending: true });

  if (status && status !== 'all')
    queryBuilder.eq('pending', status === 'invited');

  if (roles) queryBuilder.in('role', roles.split(','));

  const { data, error } = await queryBuilder;
  if (error) throw error;

  return data.map(({ email, ...rest }) => {
    return {
      ...rest,
      display_name:
        secretData.filter((secret) => secret.name === 'HIDE_MEMBER_NAME')
          .length === 0
          ? rest.display_name
          : undefined,
      email:
        secretData.filter((secret) => secret.name === 'HIDE_MEMBER_EMAIL')
          .length === 0
          ? email
          : undefined,
    };
  }) as User[];
};
