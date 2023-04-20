import { ReactElement, useEffect, useState } from 'react';
import { useSegments } from '../../../hooks/useSegments';
import { PageWithLayoutProps } from '../../../types/PageWithLayoutProps';
import NestedLayout from '../../../components/layouts/NestedLayout';
import HeaderX from '../../../components/metadata/HeaderX';
import { useWorkspaces } from '../../../hooks/useWorkspaces';
import useTranslation from 'next-translate/useTranslation';
import { enforceRootWorkspace } from '../../../utils/serverless/enforce-root-workspace';
import PaginationIndicator from '../../../components/pagination/PaginationIndicator';
import { Divider, TextInput } from '@mantine/core';
import PaginationSelector from '../../../components/selectors/PaginationSelector';
import ModeSelector, { Mode } from '../../../components/selectors/ModeSelector';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useLocalStorage } from '@mantine/hooks';
import { User } from '../../../types/primitives/User';
import useSWR from 'swr';
import UserCard from '../../../components/cards/UserCard';

export const getServerSideProps = enforceRootWorkspace;

const InfrastructureUsersPage: PageWithLayoutProps = () => {
  const { setRootSegment } = useSegments();
  const { ws } = useWorkspaces();

  const { t } = useTranslation('infrastructure-tabs');

  const infrastructureLabel = t('infrastructure');
  const usersLabel = t('users');

  useEffect(() => {
    setRootSegment(
      ws
        ? [
            {
              content: ws?.name || 'Tổ chức không tên',
              href: `/${ws.id}`,
            },
            { content: infrastructureLabel, href: `/${ws.id}/infrastructure` },
            { content: usersLabel, href: `/${ws.id}/infrastructure/users` },
          ]
        : []
    );

    return () => setRootSegment([]);
  }, [infrastructureLabel, usersLabel, ws, setRootSegment]);

  const [query, setQuery] = useState('');
  const [activePage, setPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useLocalStorage({
    key: 'infrastructure-users-per-page',
    defaultValue: 15,
  });

  const apiPath = ws?.id
    ? `/api/users?query=${query}&page=${activePage}&itemsPerPage=${itemsPerPage}`
    : null;

  const countApi = ws?.id ? `/api/users/count` : null;

  const { data: users } = useSWR<User[]>(apiPath);
  const { data: count } = useSWR<number>(countApi);

  const [mode, setMode] = useLocalStorage<Mode>({
    key: 'workspace-users-mode',
    defaultValue: 'grid',
  });

  if (!ws) return null;

  return (
    <>
      <HeaderX label={`${usersLabel} – ${infrastructureLabel}`} />
      <div className="flex min-h-full w-full flex-col pb-8">
        <div className="mt-2 grid items-end gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TextInput
            label="Tìm kiếm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập từ khoá để tìm kiếm"
            icon={<MagnifyingGlassIcon className="h-5" />}
            classNames={{
              input: 'bg-white/5 border-zinc-300/20 font-semibold',
            }}
          />
          <ModeSelector mode={mode} setMode={setMode} />
          <PaginationSelector
            items={itemsPerPage}
            setItems={(size) => {
              setPage(1);
              setItemsPerPage(size);
            }}
          />
          <div className="hidden xl:block" />
        </div>

        <Divider className="mt-4" />
        <PaginationIndicator
          activePage={activePage}
          setActivePage={setPage}
          itemsPerPage={itemsPerPage}
          totalItems={count}
        />

        <div
          className={`grid gap-4 ${
            mode === 'grid' && 'md:grid-cols-2 xl:grid-cols-4'
          }`}
        >
          {users && users?.map((u) => <UserCard key={u.id} user={u} />)}
        </div>
      </div>
    </>
  );
};

InfrastructureUsersPage.getLayout = function getLayout(page: ReactElement) {
  return <NestedLayout mode="infrastructure">{page}</NestedLayout>;
};

export default InfrastructureUsersPage;