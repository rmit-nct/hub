'use client';

import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import useTranslation from 'next-translate/useTranslation';
import { AIPrompt } from '@/types/db';

interface AIPromptRowActions {
  row: Row<AIPrompt>;
  setAIPrompt: (value: AIPrompt | undefined) => void;
}

export function AIPromptRowActions(props: AIPromptRowActions) {
  const { t } = useTranslation();

  const router = useRouter();
  const data = props.row.original;

  const deleteAIPrompt = async () => {
    const res = await fetch(
      `/api/v1/workspaces/${data.ws_id}/ai/prompts/${data.id}`,
      {
        method: 'DELETE',
      }
    );

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      toast({
        title: 'Failed to delete workspace wallet',
        description: data.message,
      });
    }
  };

  if (!data.id || !data.ws_id) return null;

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => props.setAIPrompt(data)}>
            {t('common:edit')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={deleteAIPrompt}>
            {t('common:delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
