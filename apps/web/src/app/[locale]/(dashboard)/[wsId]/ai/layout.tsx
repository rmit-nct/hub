import { NavLink, Navigation } from '@/components/navigation';
import { getCurrentUser } from '@/lib/user-helper';
import { getWorkspace } from '@/lib/workspace-helper';
import { getTranslations } from 'next-intl/server';
import React from 'react';

interface LayoutProps {
  params: {
    wsId: string;
  };
  children: React.ReactNode;
}

export default async function Layout({
  children,
  params: { wsId },
}: LayoutProps) {
  const t = await getTranslations('workspace-ai-layout');

  const workspace = await getWorkspace(wsId);
  const user = await getCurrentUser();

  const navLinks: NavLink[] = [
    {
      title: t('overview'),
      href: `/${wsId}/ai`,
      matchExact: true,
    },
    {
      title: t('prompts'),
      href: `/${wsId}/ai/prompts`,
    },
    {
      title: t('workflows'),
      href: `/${wsId}/ai/workflows`,
      disabled: true,
    },
    {
      title: t('pipelines'),
      href: `/${wsId}/ai/pipelines`,
      disabled: true,
    },
    {
      title: t('test_generation'),
      href: `/${wsId}/ai/test-generation`,
      disabled: true,
    },
  ];

  return (
    <div>
      <Navigation
        currentWsId={wsId}
        currentRole={workspace?.role}
        currentUser={user}
        navLinks={navLinks}
      />
      {children}
    </div>
  );
}
