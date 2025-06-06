'use client';

import QuizSetRowActionsForm from './form';
import type { WorkspaceQuizSet } from '@ncthub/types/db';
import { Button } from '@ncthub/ui/button';
import ModifiableDialogTrigger from '@ncthub/ui/custom/modifiable-dialog-trigger';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ncthub/ui/dropdown-menu';
import { toast } from '@ncthub/ui/hooks/use-toast';
import { Ellipsis } from '@ncthub/ui/icons';
import { Row } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface QuizSetRowActionsProps {
  wsId: string;
  moduleId: string;
  row: Row<WorkspaceQuizSet>;
}

export function QuizSetRowActions({
  wsId,
  moduleId,
  row,
}: QuizSetRowActionsProps) {
  const router = useRouter();
  const t = useTranslations();

  const data = row.original;

  const deleteQuizSetRowActions = async () => {
    const res = await fetch(`/api/v1/workspaces/${wsId}/quiz-sets/${data.id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      toast({
        title: 'Failed to delete workspace user group tag',
        description: data.message,
      });
    }
  };

  const [showEditDialog, setShowEditDialog] = useState(false);

  if (!data.id || !wsId) return null;

  return (
    <div className="flex items-center justify-end gap-2">
      {/* {data.href && (
        <Link href={data.href}>
          <Button>
            <Eye className="mr-1 h-5 w-5" />
            {t('common.view')}
          </Button>
        </Link>
      )} */}

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <Ellipsis className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            {t('common.edit')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={deleteQuizSetRowActions}>
            {t('common.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ModifiableDialogTrigger
        data={data}
        open={showEditDialog}
        title={t('ws-flashcards.edit')}
        editDescription={t('ws-flashcards.edit_description')}
        setOpen={setShowEditDialog}
        form={
          <QuizSetRowActionsForm wsId={wsId} moduleId={moduleId} data={data} />
        }
      />
    </div>
  );
}
