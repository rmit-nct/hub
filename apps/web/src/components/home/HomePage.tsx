import { useEffect } from 'react';
import { useSegments } from '../../hooks/useSegments';
import { Workspace } from '../../types/primitives/Workspace';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import { openModal } from '@mantine/modals';
import WorkspaceEditForm from '../forms/WorkspaceEditForm';
import { showNotification } from '@mantine/notifications';
import { mutate } from 'swr';
import HeaderX from '../metadata/HeaderX';
import LoadingIndicator from '../common/LoadingIndicator';
import WorkspaceInviteSnippet from '../notifications/WorkspaceInviteSnippet';
import WorkspacePreviewCard from '../cards/WorkspacePreviewCard';

const HomePage = () => {
  const { setRootSegment } = useSegments();

  useEffect(() => {
    setRootSegment({
      content: 'Home',
      href: '/',
    });
  }, [setRootSegment]);

  const { workspaces, workspacesLoading, workspaceInvites, createWorkspace } =
    useWorkspaces();

  const showEditWorkspaceModal = (ws?: Workspace) => {
    openModal({
      title: 'New workspace',
      centered: true,
      children: <WorkspaceEditForm ws={ws} onSubmit={createWorkspace} />,
    });
  };

  const acceptInvite = async (ws: Workspace) => {
    const response = await fetch(`/api/workspaces/${ws.id}/invites`, {
      method: 'POST',
    });

    if (response.ok) {
      mutate('/api/workspaces');
      showNotification({
        title: `Accepted invite to ${ws.name}`,
        message: 'You can now access this workspace',
      });
    } else {
      showNotification({
        title: `Failed to accept invite to ${ws.name}`,
        message: 'Please try again later',
      });
    }
  };

  const declineInvite = async (ws: Workspace) => {
    const response = await fetch(`/api/workspaces/${ws.id}/invites`, {
      method: 'DELETE',
    });

    if (response.ok) {
      mutate('/api/workspaces');
    } else {
      showNotification({
        title: `Failed to decline invite to ${ws.name}`,
        message: 'Please try again later',
      });
    }
  };

  return (
    <div className="p-4 md:p-8">
      <HeaderX label="Home" />
      {workspacesLoading ? (
        <div className="flex items-center justify-center">
          <LoadingIndicator className="h-8" />
        </div>
      ) : (
        <>
          {(workspaceInvites?.length || 0) > 0 && (
            <div className="mb-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {workspaceInvites?.map((ws) => (
                <WorkspaceInviteSnippet
                  key={ws.id}
                  ws={ws}
                  onAccept={acceptInvite}
                  onDecline={declineInvite}
                />
              ))}
            </div>
          )}

          {(workspaces?.length || 0) > 0 ? (
            <div className="grid gap-8">
              {workspaces?.map((ws) => (
                <WorkspacePreviewCard key={ws.id} ws={ws} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex flex-row">
                You are not a member of any workspaces.
              </div>
            </div>
          )}

          <button
            className="mt-8 w-full rounded bg-blue-300/20 px-8 py-4 font-semibold text-blue-300 transition duration-300 hover:bg-blue-300/30 md:w-fit"
            onClick={() => showEditWorkspaceModal()}
          >
            New workspace
          </button>
        </>
      )}
    </div>
  );
};

export default HomePage;