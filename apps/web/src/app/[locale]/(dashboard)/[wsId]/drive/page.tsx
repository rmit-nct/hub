import StorageObjectsTable from './table';
import { verifyHasSecrets } from '@/lib/workspace-helper';
import { StorageObject } from '@/types/primitives/StorageObject';
import { formatBytes } from '@/utils/file-helper';
import { createClient, createDynamicClient } from '@/utils/supabase/server';
import { Separator } from '@repo/ui/components/ui/separator';
import { getTranslations } from 'next-intl/server';

interface Props {
  params: {
    wsId: string;
  };
  searchParams: {
    q: string;
    page: string;
    pageSize: string;
  };
}

export default async function WorkspaceStorageObjectsPage({
  params: { wsId },
  searchParams,
}: Props) {
  const t = await getTranslations('ws-storage-objects');

  await verifyHasSecrets(wsId, ['ENABLE_DRIVE'], `/${wsId}`);
  const { data, count } = await getData(wsId, searchParams);

  const totalSize = await getTotalSize(wsId);
  const largestFile = await getLargestFile(wsId);
  const smallestFile = await getSmallestFile(wsId);

  return (
    <>
      <div className="border-border bg-foreground/5 flex flex-col justify-between gap-4 rounded-lg border p-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold">{t('module')}</h1>
          <p className="text-foreground/80">{t('description')}</p>
        </div>
      </div>

      <div className="mb-8 mt-4 grid gap-4 text-center md:grid-cols-2 xl:grid-cols-4">
        <div className="border-border bg-foreground/5 rounded-lg border p-4">
          <h2 className="text-lg font-semibold">{t('total_files')}</h2>
          <Separator className="my-2" />
          <div className="text-3xl font-bold">{count}</div>
        </div>

        <div className="border-border bg-foreground/5 rounded-lg border p-4">
          <h2 className="text-lg font-semibold">{t('total_size')}</h2>
          <Separator className="my-2" />
          <div className="text-3xl font-bold">{formatBytes(totalSize)}</div>
        </div>

        <div className="border-border bg-foreground/5 rounded-lg border p-4">
          <h2 className="text-lg font-semibold">{t('largest_file')}</h2>
          <Separator className="my-2" />
          <div className="text-3xl font-bold">
            {data.length > 0 ? formatBytes(largestFile?.size as number) : '-'}
          </div>
        </div>

        <div className="border-border bg-foreground/5 rounded-lg border p-4">
          <h2 className="text-lg font-semibold">{t('smallest_file')}</h2>
          <Separator className="my-2" />
          <div className="text-3xl font-bold">
            {data.length > 0 ? formatBytes(smallestFile?.size as number) : '-'}
          </div>
        </div>
      </div>

      <StorageObjectsTable
        wsId={wsId}
        data={data.map((t) => ({
          ...t,
          ws_id: wsId,
        }))}
        count={count}
      />
    </>
  );
}

async function getData(
  wsId: string,
  {
    q,
    page = '1',
    pageSize = '10',
  }: { q?: string; page?: string; pageSize?: string }
) {
  const supabase = createDynamicClient();

  const queryBuilder = supabase
    .schema('storage')
    .from('objects')
    .select('*', {
      count: 'exact',
    })
    .eq('bucket_id', 'workspaces')
    .not('owner', 'is', null)
    .ilike('name', `${wsId}/%`)
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

  return { data, count } as {
    data: StorageObject[];
    count: number;
  };
}

async function getTotalSize(wsId: string) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_workspace_drive_size', {
    ws_id: wsId,
  });

  if (error) throw error;
  return data;
}

async function getLargestFile(wsId: string) {
  const supabase = createDynamicClient();

  const { data, error } = await supabase
    .schema('storage')
    .from('objects')
    .select('metadata->size')
    .eq('bucket_id', 'workspaces')
    .not('owner', 'is', null)
    .ilike('name', `${wsId}/%`)
    .order('metadata->size', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getSmallestFile(wsId: string) {
  const supabase = createDynamicClient();

  const { data, error } = await supabase
    .schema('storage')
    .from('objects')
    .select('metadata->size')
    .eq('bucket_id', 'workspaces')
    .not('owner', 'is', null)
    .ilike('name', `${wsId}/%`)
    .order('metadata->size', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}
