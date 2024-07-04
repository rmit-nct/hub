'use client';

import { useAtTop } from '@/lib/hooks/use-at-bottom';
import { Button, type ButtonProps } from '@repo/ui/components/ui/button';
import { IconArrowDown } from '@repo/ui/components/ui/icons';
import { cn } from '@repo/ui/lib/utils';

export function ScrollToTopButton({ className, ...props }: ButtonProps) {
  const isAtTop = useAtTop();

  return (
    <Button
      className={cn(
        'bg-background/20 flex-none backdrop-blur-lg transition-opacity duration-300',
        className
      )}
      onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }}
      size="icon"
      variant="outline"
      disabled={isAtTop}
      {...props}
    >
      <IconArrowDown className="rotate-180" />
      <span className="sr-only">Scroll to top</span>
    </Button>
  );
}
