import NavbarActions from '../(marketing)/navbar-actions';
import { UserNav } from '../(marketing)/user-nav';
import Structure from '@/components/layout/structure';
import {
  MAIN_CONTENT_SIZE_COOKIE_NAME,
  SIDEBAR_COLLAPSED_COOKIE_NAME,
  SIDEBAR_SIZE_COOKIE_NAME,
} from '@/constants/common';
import { createClient } from '@tuturuuu/supabase/next/server';
import {
  Bell,
  Bot,
  Calendar,
  Home,
  MessageCircle,
  Users,
} from '@tuturuuu/ui/icons';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode, Suspense } from 'react';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) redirect('/login');

  const sidebarSize = (await cookies()).get(SIDEBAR_SIZE_COOKIE_NAME);
  const mainSize = (await cookies()).get(MAIN_CONTENT_SIZE_COOKIE_NAME);

  const collapsed = (await cookies()).get(SIDEBAR_COLLAPSED_COOKIE_NAME);

  const defaultLayout =
    sidebarSize !== undefined && mainSize !== undefined
      ? [JSON.parse(sidebarSize.value), JSON.parse(mainSize.value)]
      : undefined;

  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  const navItems = [
    {
      name: 'Home',
      href: '/home',
      icon: <Home className="h-4 w-4" />,
    },
    {
      name: 'Fami',
      href: '/fami',
      icon: <Bot className="h-4 w-4" />,
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: <MessageCircle className="h-4 w-4" />,
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: <Bell className="h-4 w-4" />,
    },
    {
      name: 'Manage',
      href: '/manage',
      icon: <Users className="h-4 w-4" />,
    },
  ];

  return (
    <Structure
      allowChallengeManagement={false}
      allowRoleManagement={false}
      defaultLayout={defaultLayout}
      defaultCollapsed={defaultCollapsed}
      navCollapsedSize={4}
      navItems={navItems}
      actions={
        <Suspense
          fallback={
            <div className="bg-foreground/5 h-10 w-[88px] animate-pulse rounded-lg" />
          }
        >
          <NavbarActions />
        </Suspense>
      }
      userPopover={
        <Suspense
          fallback={
            <div className="bg-foreground/5 h-10 w-10 animate-pulse rounded-lg" />
          }
        >
          <UserNav hideMetadata />
        </Suspense>
      }
    >
      {/* <ApologyModal /> */}
      {children}
    </Structure>
  );
}
