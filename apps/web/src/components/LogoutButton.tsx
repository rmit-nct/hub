'use client';

import { Button } from '@ncthub/ui/button';
import { toast } from '@ncthub/ui/sonner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { logoutFromClient } from '@/lib/client-logout';

export default function LogoutButton() {
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
    <Button
      onClick={() => void logout()}
      disabled={isLoggingOut}
      variant="destructive"
      className="font-semibold text-red-300 hover:text-red-200"
    >
      {t('logout')}
    </Button>
  );
}
