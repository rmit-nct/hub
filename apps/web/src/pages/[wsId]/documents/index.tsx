import { ReactElement, useEffect, useState } from 'react';
import HeaderX from '../../../components/metadata/HeaderX';
import { useSegments } from '../../../hooks/useSegments';
import { PageWithLayoutProps } from '../../../types/PageWithLayoutProps';
import DocumentCard from '../../../components/document/DocumentCard';
import { useUser } from '@supabase/auth-helpers-react';
import useSWR from 'swr';
import { Document } from '../../../types/primitives/Document';
import NestedLayout from '../../../components/layouts/NestedLayout';
import { Divider, Loader } from '@mantine/core';
import { openModal } from '@mantine/modals';
import DocumentEditForm from '../../../components/forms/DocumentEditForm';
import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/router';
import {
  DocumentPlusIcon,
  ListBulletIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/solid';
import { useWorkspaces } from '../../../hooks/useWorkspaces';
import useTranslation from 'next-translate/useTranslation';

const DocumentsPage: PageWithLayoutProps = () => {
  const router = useRouter();
  const user = useUser();

  const { ws } = useWorkspaces();
  const { setRootSegment } = useSegments();

  const { data: workspace } = useSWR(
    ws?.id ? `/api/workspaces/${ws?.id}` : null
  );

  const { t } = useTranslation('documents');

  const documentsLabel = t('documents');

  const creatingLabel = t('creating');
  const newDocumentLabel = t('new-document');
  const noDocumentsLabel = t('no-documents');
  const createDocumentErrorLabel = t('create-document-error');
  const createNewDocumentLabel = t('create-new-document');

  useEffect(() => {
    setRootSegment(
      ws?.id
        ? [
            {
              content: workspace?.name || 'Unnamed Workspace',
              href: `/${ws.id}`,
            },
            { content: documentsLabel, href: `/${ws.id}/documents` },
          ]
        : []
    );
  }, [ws?.id, workspace?.name, documentsLabel, setRootSegment]);

  const { data: documents } = useSWR<Document[]>(
    user?.id && ws?.id ? `/api/workspaces/${ws.id}/documents` : null
  );

  const [creating, setCreating] = useState(false);
  const [mode, setMode] = useState<'list' | 'grid'>('grid');

  const createDocument = async ({
    wsId,
    doc,
  }: {
    wsId: string;
    doc: Partial<Document>;
  }) => {
    if (!ws) return;
    setCreating(true);

    const res = await fetch(`/api/workspaces/${ws.id}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: doc.name,
      }),
    });

    if (!res.ok) {
      showNotification({
        title: 'Error',
        message: createDocumentErrorLabel,
        color: 'red',
      });
      return;
    }

    const { id } = await res.json();
    router.push(`/${wsId}/documents/${id}`);
  };

  const showDocumentEditForm = () => {
    if (!ws) return;
    openModal({
      title: <div className="font-semibold">{createNewDocumentLabel}</div>,
      centered: true,
      children: (
        <DocumentEditForm
          onSubmit={(doc) => createDocument({ wsId: ws?.id, doc })}
        />
      ),
    });
  };

  return (
    <div className="">
      <HeaderX label="Documents" />

      <div className="flex flex-col items-center gap-4 md:flex-row">
        <h1 className="w-full flex-grow rounded-lg bg-zinc-500/5 p-4 text-2xl font-bold dark:bg-zinc-900 md:w-auto">
          {documentsLabel}{' '}
          <span className="rounded-lg bg-purple-500/10 px-2 text-lg text-purple-600 dark:bg-purple-300/20 dark:text-purple-300">
            {documents?.length || 0}
          </span>
        </h1>

        <div className="flex gap-4">
          <button
            onClick={showDocumentEditForm}
            className="flex flex-none items-center gap-1 rounded bg-blue-500/10 p-4 font-semibold text-blue-600 transition hover:bg-blue-500/20 dark:bg-blue-300/20 dark:text-blue-300 dark:hover:bg-blue-300/10"
          >
            {creating ? creatingLabel : newDocumentLabel}{' '}
            {creating ? (
              <Loader className="ml-1 h-4 w-4" />
            ) : (
              <DocumentPlusIcon className="h-4 w-4" />
            )}
          </button>
          <div className="flex gap-2 rounded-lg border border-zinc-300 p-2 dark:border-zinc-800">
            <button
              className={`${
                mode === 'list'
                  ? 'bg-zinc-500/20 dark:bg-zinc-800'
                  : 'text-zinc-700'
              } h-fit rounded-lg p-2 transition`}
              onClick={() => setMode('list')}
            >
              <ListBulletIcon className="h-6 w-6" />
            </button>
            <button
              className={`${
                mode === 'grid'
                  ? 'bg-zinc-500/20 dark:bg-zinc-800'
                  : 'text-zinc-700'
              } h-fit rounded-lg p-2 transition`}
              onClick={() => setMode('grid')}
            >
              <Squares2X2Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <Divider className="my-4" />

      <div
        className={`grid ${
          mode === 'list'
            ? 'grid-cols-1'
            : 'md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
        } mt-2 gap-4`}
      >
        {documents && documents.length === 0 && (
          <div className="col-span-full text-zinc-500">{noDocumentsLabel}</div>
        )}

        {ws &&
          documents &&
          documents?.map((doc) => (
            <DocumentCard
              key={`doc-${doc.id}`}
              wsId={ws?.id}
              document={doc}
              mode={mode}
            />
          ))}
      </div>
    </div>
  );
};

DocumentsPage.getLayout = function getLayout(page: ReactElement) {
  return <NestedLayout noTabs>{page}</NestedLayout>;
};

export default DocumentsPage;
