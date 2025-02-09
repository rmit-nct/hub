'use client';

import { StorageFolderForm, StorageObjectForm } from './form';
import { Button } from '@repo/ui/components/ui/button';
import ModifiableDialogTrigger from '@repo/ui/components/ui/custom/modifiable-dialog-trigger';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/ui/dropdown-menu';
import { File, Folder, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface Props {
  wsId: string;
  path?: string;
}

export default function NewActions({ wsId, path }: Props) {
  const t = useTranslations();

  const [showFileUploadDialog, setFileUploadDialog] = useState(false);
  const [showFolderCreateDialog, setFolderCreateDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="xs" className="cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>{t('common.create_new')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => setFileUploadDialog(true)}>
            <File className="mr-2 h-4 w-4" />
            {t('ws-storage-objects.files')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setFolderCreateDialog(true)}>
            <Folder className="mr-2 h-4 w-4" />
            {t('ws-storage-objects.folder')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ModifiableDialogTrigger
        open={showFileUploadDialog}
        setOpen={setFileUploadDialog}
        title={t('ws-storage-objects.upload')}
        form={
          <StorageObjectForm
            wsId={wsId}
            uploadPath={path}
            submitLabel={t('common.upload')}
          />
        }
      />

      <ModifiableDialogTrigger
        open={showFolderCreateDialog}
        title={t('ws-storage-objects.folder_create')}
        setOpen={setFolderCreateDialog}
        form={<StorageFolderForm wsId={wsId} uploadPath={path} />}
      />
    </>
  );
}
