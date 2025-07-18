'use client';

import { useAtBottom } from '@/lib/hooks/use-at-bottom';
import { Button, type ButtonProps } from '@ncthub/ui/button';
import { IconArrowDown } from '@ncthub/ui/icons';
import { cn } from '@ncthub/utils/format';
import { useEffect, useState } from 'react';

export function ScrollToBottomButton({ className, ...props }: ButtonProps) {
  const isAtBottom = useAtBottom(50);
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setElement(document.getElementById('main-content'));
    return () => {
      setElement(null);
    };
  }, []);

  if (!element) return null;

  return (
    <Button
      className={cn(
        'flex-none bg-background/20 backdrop-blur-lg transition-opacity duration-300',
        className
      )}
      onClick={() => {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth',
        });
      }}
      size="icon"
      variant="outline"
      disabled={isAtBottom}
      {...props}
    >
      <IconArrowDown />
      <span className="sr-only">Scroll to bottom</span>
    </Button>
  );
}
