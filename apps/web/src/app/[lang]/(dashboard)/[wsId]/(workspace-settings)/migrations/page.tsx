import MigrationDashboard from './migration-dashboard';
import { ROOT_WORKSPACE_ID } from '@/constants/common';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: {
    wsId: string;
  };
}

export default async function PlatformMigrationsPage({
  params: { wsId },
}: Props) {
  if (wsId !== ROOT_WORKSPACE_ID) redirect(`/${wsId}`);
  return <MigrationDashboard />;
}
