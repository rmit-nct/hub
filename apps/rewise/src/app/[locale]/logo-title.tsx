'use client';

import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

export default function LogoTitle({
  forceShow = false,
  className,
}: {
  forceShow?: boolean;
  className?: string;
}) {
  const params = useParams();
  const hasWorkspace = !!params.wsId;

  if (!forceShow && hasWorkspace) return null;
  return (
    <div
      className={cn('text-4xl font-bold md:text-3xl lg:text-4xl', className)}
    >
      Rewise
    </div>
  );
}
