import InviteMemberButton from './invite-member-button';
import { MemberSettingsButton } from './member-settings-button';
import { getCurrentUser } from '@/lib/user-helper';
import { User } from '@/types/primitives/User';
import { Workspace } from '@/types/primitives/Workspace';
import { getInitials } from '@/utils/name-helper';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/ui/components/ui/avatar';
import { cn } from '@repo/ui/lib/utils';
import { User as UserIcon } from 'lucide-react';
import moment from 'moment';
import useTranslation from 'next-translate/useTranslation';

interface Props {
  workspace?: Workspace | null;
  members: User[];
  invited?: boolean;
  loading?: boolean;
}

export default async function MemberList({
  workspace,
  members,
  invited,
  loading,
}: Props) {
  const { t, lang } = useTranslation('ws-members');
  const user = await getCurrentUser();

  if (!members || members.length === 0) {
    return (
      <div className="border-border bg-primary-foreground/20 col-span-full flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8">
        <p className="text-foreground/80 text-center">
          {invited ? t('no_invited_members_found') : t('no_members_match')}.
        </p>

        {!!workspace?.id && (
          <InviteMemberButton
            wsId={workspace?.id}
            currentUser={{
              ...user!,
              role: workspace?.role,
            }}
            label={t('invite_member')}
            variant="outline"
          />
        )}
      </div>
    );
  }

  return members.map((member) => (
    <div
      key={member.id}
      className={`border-border relative rounded-lg border p-4 ${
        member?.pending
          ? 'border-dashed bg-transparent'
          : 'bg-primary-foreground/20'
      }`}
    >
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={member?.avatar_url ?? undefined} />
          <AvatarFallback className="font-semibold">
            {!loading && member?.display_name ? (
              getInitials(member.display_name)
            ) : (
              <UserIcon className="h-5 w-5" />
            )}
          </AvatarFallback>
        </Avatar>

        <div className={loading ? 'text-transparent' : ''}>
          <p className="font-semibold lg:text-lg">
            {member?.display_name ? (
              member.display_name
            ) : (
              <span className="opacity-50">Unknown</span>
            )}{' '}
            {member?.role_title ? (
              <span className="text-orange-300">({member.role_title})</span>
            ) : null}
          </p>
          <p
            className={`text-sm font-semibold ${
              loading ? 'text-transparent' : 'text-foreground/60'
            }`}
          >
            {member?.email ||
              (member?.handle
                ? `@${member.handle}`
                : member?.id?.replace(/-/g, ''))}
          </p>
        </div>
      </div>

      {workspace && (
        <div className="absolute right-4 top-4 flex gap-2">
          <MemberSettingsButton
            workspace={workspace}
            user={member}
            currentUser={{ ...user!, role: workspace.role }}
          />
        </div>
      )}

      <div className="border-border mt-2 flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-sm md:text-base lg:gap-4">
        {loading || member?.created_at ? (
          <div
            className={`line-clamp-1 ${
              loading ? 'text-transparent' : 'text-foreground/80'
            }`}
          >
            <span className="opacity-90">
              {t(member?.pending ? 'invited' : 'member_since')}
            </span>{' '}
            <span className="font-semibold">
              {moment(member.created_at).locale(lang).fromNow()}
            </span>
            .
          </div>
        ) : null}

        <div className="flex gap-2">
          {user?.id === member.id && (
            <div
              className={`rounded border px-2 py-0.5 text-center font-semibold ${
                loading
                  ? 'text-transparent'
                  : 'border-border bg-primary text-primary-foreground'
              }`}
            >
              {t('you')}
            </div>
          )}

          <div
            className={cn(
              `flex-initial rounded border px-2 py-0.5 text-center font-semibold ${
                member?.pending ? 'border-dashed opacity-60' : ''
              }`,
              loading
                ? 'text-transparent'
                : 'border-border bg-foreground/5 text-foreground'
            )}
          >
            {t(member?.role?.toLocaleLowerCase() || 'unknown')}
          </div>
        </div>
      </div>
    </div>
  ));
}
