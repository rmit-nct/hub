'use client';

import type { SupabaseUser } from '@ncthub/supabase/next/user';
import { Button } from '@ncthub/ui/button';
import { toast } from '@ncthub/ui/sonner';
import { cn } from '@ncthub/utils/format';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AuthButton({
  user,
  onClick,
  className,
}: {
  user: SupabaseUser | null;
  onClick?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const signOut = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      onClick?.();
      router.replace('/login');
    } catch (error) {
      setIsLoggingOut(false);
      toast('Error', {
        description:
          error instanceof Error ? error.message : 'Failed to log out.',
      });
    }
  };

  return user ? (
    <div className="grid gap-2">
      <div className="break-all">
        <div className="text-xs">Logged in as</div>
        <div className="line-clamp-1 font-semibold text-sm">{user.email}</div>
      </div>
      <Button
        type="button"
        onClick={() => void signOut()}
        disabled={isLoggingOut}
        variant="destructive"
        className={cn('w-full', className)}
      >
        Logout
      </Button>
    </div>
  ) : (
    <Link href="/login" onClick={onClick} className="w-full">
      <Button className="w-full">Login</Button>
    </Link>
  );
}
