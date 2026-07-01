import { AlertCircle, Check, Loader2, XCircle } from '@ncthub/ui/icons';
import { cn } from '@ncthub/utils/format';
import type { SlugAvailabilityResult } from './functions';

export type SlugAvailabilityState =
  | SlugAvailabilityResult
  | {
      available: false;
      message: string;
      slug: string;
      status: 'checking';
    };

function getSlugAvailabilityClassName(status: SlugAvailabilityState['status']) {
  return cn(
    'flex items-center gap-1.5 text-sm',
    status === 'available' && 'text-green-600 dark:text-green-400',
    status === 'checking' && 'text-muted-foreground',
    (status === 'invalid' || status === 'taken') && 'text-destructive',
    status === 'error' && 'text-dynamic-light-yellow'
  );
}

function SlugAvailabilityIcon({
  status,
}: {
  status: SlugAvailabilityState['status'];
}) {
  if (status === 'checking') {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  if (status === 'available') {
    return <Check className="h-4 w-4" />;
  }

  if (status === 'taken') {
    return <XCircle className="h-4 w-4" />;
  }

  return <AlertCircle className="h-4 w-4" />;
}

export function SlugAvailabilityFeedback({
  availability,
}: {
  availability: SlugAvailabilityState | null;
}) {
  if (!availability) {
    return (
      <p id="customSlug-status" className="text-muted-foreground text-sm">
        Letters, numbers, hyphens, and underscores only.
      </p>
    );
  }

  return (
    <p
      id="customSlug-status"
      className={getSlugAvailabilityClassName(availability.status)}
      aria-live="polite"
    >
      <SlugAvailabilityIcon status={availability.status} />
      {availability.message}
    </p>
  );
}
