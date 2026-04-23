import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import WorkspaceInviteSnippet from '@/components/notifications/WorkspaceInviteSnippet';
import { getWorkspaceInvites, getWorkspaces } from '@/lib/workspace-helper';

export default async function WorkspaceInvites() {
  const t = await getTranslations('onboarding');

  const workspaces = await getWorkspaces();
  const workspaceInvites = await getWorkspaceInvites();

  if (workspaces?.[0]?.id) redirect(`/${workspaces[0].id}`);

  return (
    <div className="scrollbar-none grid h-full w-full gap-4 overflow-y-auto">
      {workspaceInvites.length ? (
        workspaceInvites.map((ws) => (
          <WorkspaceInviteSnippet key={ws.id} ws={ws} />
        ))
      ) : (
        <div className="flex h-full items-center justify-center px-4 py-16 text-center font-semibold text-foreground/60 text-lg md:text-2xl">
          {t('no-invites')}
        </div>
      )}
    </div>
  );
}
