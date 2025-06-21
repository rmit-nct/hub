'use client';

import { Button } from '../button';
import { cn } from '@ncthub/utils/format';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function GetStartedButton({
  text,
  href,
  disabled = false,
}: {
  text: string;
  href: string;
  disabled?: boolean;
}) {
  const pathname = usePathname();
  const hidden = pathname === '/login';

  return (
    <Link href={href}>
      <Button
        disabled={disabled}
        className={cn(
          hidden &&
            'pointer-events-none bg-transparent text-foreground/50 opacity-50 select-none'
        )}
      >
        {text}
      </Button>
    </Link>
  );
}
