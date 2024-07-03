'use client';

import ProjectForm, { ApiConfigFormSchema } from './project-form';
import { TaskBoard } from '@/types/primitives/TaskBoard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog';
import { toast } from '@repo/ui/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import * as z from 'zod';

interface Props {
  data?: TaskBoard;
  trigger?: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  submitLabel?: string;
}

export default function ProjectEditDialog({
  data,
  trigger,
  open: externalOpen,
  setOpen: setExternalOpen,
  submitLabel,
}: Props) {
  const router = useRouter();
  const t = useTranslations('ws-projects');

  const [internalOpen, setInternalOpen] = useState(false);

  const open = externalOpen ?? internalOpen;
  const setOpen = setExternalOpen ?? setInternalOpen;

  const handleSubmit = async (values: z.infer<typeof ApiConfigFormSchema>) => {
    const res = await fetch(
      data?.id
        ? `/api/workspaces/${data?.ws_id}/projects/${data.id}`
        : `/api/workspaces/${data?.ws_id}/projects`,
      {
        method: data?.id ? 'PUT' : 'POST',
        body: JSON.stringify(values),
      }
    );

    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      toast({
        title: `Failed to ${data.id ? 'edit' : 'create'} project`,
        description: data.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        onOpenAutoFocus={(e) => (data?.name ? e.preventDefault() : null)}
      >
        <DialogHeader>
          <DialogTitle>{t('workspace_project')}</DialogTitle>
          <DialogDescription>
            {data?.id
              ? t('edit_existing_workspace_project')
              : t('add_new_workspace_project')}
          </DialogDescription>
        </DialogHeader>

        <ProjectForm
          data={data}
          onSubmit={handleSubmit}
          submitLabel={submitLabel}
        />
      </DialogContent>
    </Dialog>
  );
}
