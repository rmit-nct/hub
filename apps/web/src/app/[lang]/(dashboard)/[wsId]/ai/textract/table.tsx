'use client';

import { aiPromptsColumns } from './columns';
import { AIPromptForm } from './form';
import { DataTable } from '@/components/ui/custom/tables/data-table';
import { Dialog } from '@/components/ui/dialog';
import { AIPrompt } from '@/types/db';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

interface Props {
  wsId: string;
  data: AIPrompt[];
  count: number;
}

export default function AIPromptsTable({ wsId, data, count }: Props) {
  const { t } = useTranslation('common');

  const [prompt, setPrompt] = useState<Partial<AIPrompt> | undefined>();

  const onComplete = () => {
    // setPrompt(undefined);
  };

  return (
    <Dialog
      open={!!prompt}
      onOpenChange={(open) => setPrompt(open ? prompt || {} : undefined)}
    >
      <DataTable
        data={data}
        columnGenerator={(t) => aiPromptsColumns(t, setPrompt)}
        namespace="ai-prompts-data-table"
        count={count}
        defaultVisibility={{
          id: false,
          description: false,
          type: false,
          currency: false,
          report_opt_in: false,
          created_at: false,
        }}
        editContent={
          <AIPromptForm
            wsId={wsId}
            data={prompt}
            onComplete={onComplete}
            submitLabel={prompt?.id ? t('edit') : t('create')}
          />
        }
      />
    </Dialog>
  );
}
