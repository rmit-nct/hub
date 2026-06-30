'use client';

import { DropdownMenuItem } from '@ncthub/ui/dropdown-menu';
import { LogOut } from '@ncthub/ui/icons';
import { toast } from '@ncthub/ui/sonner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { logoutFromClient } from '@/lib/client-logout';

export function LogoutDropdownItem() {
  const t = useTranslations('common');
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logoutFromClient();
      router.replace('/login');
      router.refresh();
    } catch (error) {
      setIsLoggingOut(false);
      toast(t('error'), {
        description:
          error instanceof Error ? error.message : 'Failed to log out.',
      });
    }
  };

  return (
    <DropdownMenuItem
      onSelect={(event) => {
        event.preventDefault();
        void logout();
      }}
      disabled={isLoggingOut}
      className="cursor-pointer"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>{t('logout')}</span>
    </DropdownMenuItem>
  );
}
