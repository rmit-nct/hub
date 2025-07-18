'use client';

import { cn } from '@ncthub/utils/format';
import { useParams } from 'next/navigation';

export function LogoTitle({
  text = 'Tuturuuu',
  forceShow = false,
  className,
}: {
  text?: string;
  forceShow?: boolean;
  className?: string;
}) {
  const params = useParams();
  const hasWorkspace = !!params.wsId;

  if (!forceShow && hasWorkspace) return null;
  return <div className={cn('text-2xl font-bold', className)}>{text}</div>;
}
