import UserCard from './card';
import { EmailList } from './email-list';
import { verifyHasSecrets } from '@/lib/workspace-helper';
import type { WorkspaceUser } from '@/types/primitives/WorkspaceUser';
import { createClient } from '@/utils/supabase/server';
import FeatureSummary from '@repo/ui/components/ui/custom/feature-summary';
import { Separator } from '@repo/ui/components/ui/separator';
import { Check, CircleHelp, Send, X } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface SearchParams {
  q?: string;
  page?: string;
  pageSize?: string;
  excludedGroups?: string | string[];
}

interface Props {
  params: {
    locale: string;
    wsId: string;
    groupId: string;
    postId: string;
  };
  searchParams: SearchParams;
}

export default async function HomeworkCheck({
  params: { wsId, groupId, postId },
  searchParams,
}: Props) {
  await verifyHasSecrets(wsId, ['ENABLE_USERS'], `/${wsId}`);
  // const t = await getTranslations();

  const post = await getPostData(postId);
  const group = await getGroupData(wsId, groupId);
  const status = await getPostStatus(groupId, postId);

  const { data: rawUsers } = await getUserData(wsId, groupId, searchParams);
  const users = rawUsers.map((u) => ({
    ...u,
    href: `/${wsId}/users/database/${u.id}`,
  }));

  return (
    <div>
      <FeatureSummary
        title={
          <Link
            href={`/${wsId}/users/groups/${groupId}`}
            className="text-2xl font-bold hover:underline"
          >
            {group.name}
          </Link>
        }
        description={`${post.title}\n\n${post.content}`.trim()}
        action={<EmailList users={users} />}
      />
      <Separator className="my-4" />
      <div className="gird-cols-1 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <div className="bg-dynamic-purple/15 text-dynamic-purple border-dynamic-purple/15 flex w-full flex-col items-center gap-1 rounded border p-4">
          <div className="flex items-center gap-2 text-xl font-bold">
            <Send />
            Email sent
          </div>
          <Separator className="bg-dynamic-purple/15 my-1" />
          <div className="text-xl font-semibold md:text-3xl">
            {status.sent}
            <span className="opacity-50">/{status.count}</span>
          </div>
        </div>
        <div className="bg-dynamic-green/15 text-dynamic-green border-dynamic-green/15 flex w-full flex-col items-center gap-1 rounded border p-4">
          <div className="flex items-center gap-2 text-xl font-bold">
            <Check />
            Checked
          </div>
          <Separator className="bg-dynamic-green/15 my-1" />
          <div className="text-3xl font-semibold">
            {status.checked}
            <span className="opacity-50">/{status.count}</span>
          </div>
        </div>
        <div className="bg-dynamic-red/15 text-dynamic-red border-dynamic-red/15 flex w-full flex-col items-center gap-1 rounded border p-4">
          <div className="flex items-center gap-2 text-xl font-bold">
            <X />
            Failed
          </div>
          <Separator className="bg-dynamic-red/15 my-1" />
          <div className="text-3xl font-semibold">
            {status.failed}
            <span className="opacity-50">/{status.count}</span>
          </div>
        </div>
        <div className="bg-dynamic-blue/15 text-dynamic-blue border-dynamic-blue/15 flex w-full flex-col items-center gap-1 rounded border p-4">
          <div className="flex items-center gap-2 text-xl font-bold">
            <CircleHelp />
            Unknown
          </div>
          <Separator className="bg-dynamic-blue/15 my-1" />
          <div className="text-3xl font-semibold">
            {status.tenative}
            <span className="opacity-50">/{status.count}</span>
          </div>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            wsId={wsId}
            post={{
              ...post,
              group_id: groupId,
              group_name: group.name,
            }}
          />
        ))}
      </div>
    </div>
  );
}

async function getPostData(postId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_group_posts')
    .select('*')
    .eq('id', postId)
    .maybeSingle();

  if (error) throw error;
  if (!data) notFound();

  return data;
}

async function getGroupData(wsId: string, groupId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('workspace_user_groups')
    .select('*')
    .eq('ws_id', wsId)
    .eq('id', groupId)
    .maybeSingle();

  if (error) throw error;
  if (!data) notFound();

  return data;
}

async function getPostStatus(groupId: string, postId: string) {
  const supabase = createClient();

  const { data: users, count } = await supabase
    .from('workspace_user_groups_users')
    .select(
      '...workspace_users(id, user_group_post_checks!inner(post_id, is_completed))',
      {
        count: 'exact',
      }
    )
    .eq('group_id', groupId)
    .eq('workspace_users.user_group_post_checks.post_id', postId);

  return {
    sent: 0,
    checked: users?.filter((user) =>
      user?.user_group_post_checks?.find((check) => check?.is_completed)
    ).length,
    failed: users?.filter((user) =>
      user?.user_group_post_checks?.find((check) => !check?.is_completed)
    ).length,
    tenative: users?.filter((user) => !user.id).length,
    count,
  };
}

async function getUserData(
  wsId: string,
  groupId: string,
  {
    q,
    // page = '1',
    // pageSize = '10',
    excludedGroups = [],
    retry = true,
  }: SearchParams & { retry?: boolean } = {}
) {
  const supabase = createClient();

  const queryBuilder = supabase
    .rpc(
      'get_workspace_users',
      {
        _ws_id: wsId,
        included_groups: [groupId],
        excluded_groups: Array.isArray(excludedGroups)
          ? excludedGroups
          : [excludedGroups],
        search_query: q || '',
      },
      {
        count: 'exact',
      }
    )
    .select('*')
    .order('full_name', { ascending: true, nullsFirst: false });

  // if (page && pageSize) {
  //   const parsedPage = Number.parseInt(page);
  //   const parsedSize = Number.parseInt(pageSize);
  //   const start = (parsedPage - 1) * parsedSize;
  //   const end = parsedPage * parsedSize;
  //   queryBuilder.range(start, end).limit(parsedSize);
  // }

  const { data, error, count } = await queryBuilder;

  if (error) {
    if (!retry) throw error;
    return getUserData(wsId, groupId, {
      q,
      // pageSize,
      excludedGroups,
      retry: false,
    });
  }

  return { data, count } as unknown as { data: WorkspaceUser[]; count: number };
}
