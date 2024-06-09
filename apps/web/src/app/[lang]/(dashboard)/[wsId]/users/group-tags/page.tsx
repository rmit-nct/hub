import { groupTagColumns } from './columns';
import ApiKeyEditDialog from './edit-dialog';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/custom/tables/data-table';
import { Separator } from '@/components/ui/separator';
import { WorkspaceApiKey } from '@/types/primitives/WorkspaceApiKey';
import { Database } from '@/types/supabase';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Plus } from 'lucide-react';
import useTranslation from 'next-translate/useTranslation';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

interface Props {
  params: {
    wsId: string;
  };
  searchParams: {
    q?: string;
    page?: string;
    pageSize?: string;
  };
}

export default async function WorkspaceUserGroupTagsPage({
  params: { wsId },
  searchParams,
}: Props) {
  const { data: tags, count } = await getGroupTags(wsId, searchParams);
  const { t } = useTranslation('ws-user-group-tags');

  return (
    <>
      <div className="border-border bg-foreground/5 flex flex-col justify-between gap-4 rounded-lg border p-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold">{t('group_tags')}</h1>
          <p className="text-foreground/80">{t('description')}</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 md:flex-row">
          <ApiKeyEditDialog
            data={{
              ws_id: wsId,
            }}
            trigger={
              <Button>
                <Plus className="mr-2 h-5 w-5" />
                {t('create_tag')}
              </Button>
            }
            submitLabel={t('create_tag')}
          />
        </div>
      </div>
      <Separator className="my-4" />
      <DataTable
        columnGenerator={groupTagColumns}
        namespace="user-group-tag-data-table"
        data={tags}
        count={count}
        defaultVisibility={{
          id: false,
          created_at: false,
        }}
      />
    </>
  );
}

async function getGroupTags(
  wsId: string,
  {
    q,
    page = '1',
    pageSize = '10',
  }: { q?: string; page?: string; pageSize?: string }
) {
  const supabase = createServerComponentClient<Database>({ cookies });

  const queryBuilder = supabase
    .from('workspace_user_group_tags')
    .select('*', {
      count: 'exact',
    })
    .eq('ws_id', wsId)
    .order('created_at', { ascending: false });

  if (q) queryBuilder.ilike('name', `%${q}%`);

  if (page && pageSize) {
    const parsedPage = parseInt(page);
    const parsedSize = parseInt(pageSize);
    const start = (parsedPage - 1) * parsedSize;
    const end = parsedPage * parsedSize;
    queryBuilder.range(start, end).limit(parsedSize);
  }

  const { data, error, count } = await queryBuilder;
  if (error) throw error;

  return { data, count } as { data: WorkspaceApiKey[]; count: number };
}
