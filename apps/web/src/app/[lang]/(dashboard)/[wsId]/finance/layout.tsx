import { Navigation, NavLink } from '@/components/navigation';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';

interface LayoutProps {
  params: {
    wsId?: string;
  };
  children: React.ReactNode;
}

export default async function Layout({
  children,
  params: { wsId },
}: LayoutProps) {
  const { t } = useTranslation('workspace-finance-tabs');

  const navLinks: NavLink[] = [
    {
      name: t('overview'),
      href: `/${wsId}/finance`,
      matchExact: true,
    },
    {
      name: t('Member fee tracking'),
      href: `/${wsId}/finance/memberFeeTracking`,
    },
    {
      name: t('Bill Tracking'),
      href: `/${wsId}/finance/billTracking`,
      matchExact: true,
    },
    {
      name: t('Budget Planning'),
      href: `/${wsId}/finance/budgetPlanning`,
    },
    {
      name: t('invoices'),
      href: `/${wsId}/finance/invoices`,
      requireRootWorkspace: true,
    },
    {
      name: t('settings'),
      href: `/${wsId}/finance/settings`,
      disabled: true,
    },
  ];

  return (
    <>
      <div className="scrollbar-none mb-4 flex gap-1 overflow-x-auto font-semibold">
        <Navigation navLinks={navLinks} />
      </div>
      {children}
    </>
  );
}
