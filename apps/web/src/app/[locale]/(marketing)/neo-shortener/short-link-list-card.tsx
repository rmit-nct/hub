'use client';

import { Badge } from '@ncthub/ui/badge';
import { Button } from '@ncthub/ui/button';
import { Card, CardContent } from '@ncthub/ui/card';
import { Check, Copy } from '@ncthub/ui/icons';
import { cn } from '@ncthub/utils/format';
import type { CreatedShortLink } from './functions';
import ShortLinkDetails from './short-link-details';
import { formatCreatedAt } from './shortener-utils';

interface ShortLinkListCardProps {
  copiedValue: string | null;
  deleteButtonStyles: string;
  isDeleting: boolean;
  isPending: boolean;
  onCopy: (value: string) => void;
  onDeleteClick: (shortLink: CreatedShortLink) => void;
  shortLink: CreatedShortLink;
}

export default function ShortLinkListCard({
  copiedValue,
  deleteButtonStyles,
  isDeleting,
  isPending,
  onCopy,
  onDeleteClick,
  shortLink,
}: ShortLinkListCardProps) {
  const isCopied = copiedValue === shortLink.shortUrl;

  return (
    <Card className="rounded-3xl border-border/60 bg-muted/25 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full border border-brand-light-blue/15 bg-brand-light-blue/10 text-brand-light-blue hover:bg-brand-light-blue/10">
                {shortLink.slug}
              </Badge>
              {shortLink.isPasswordProtected ? (
                <Badge className="rounded-full border border-dynamic-light-yellow/20 bg-dynamic-light-yellow/10 text-dynamic-light-yellow hover:bg-dynamic-light-yellow/10">
                  Protected
                </Badge>
              ) : null}
              <span className="text-muted-foreground text-xs">
                Created {formatCreatedAt(shortLink.createdAt)}
              </span>
            </div>

            <ShortLinkDetails
              shortUrl={shortLink.shortUrl}
              destinationUrl={shortLink.link}
            />
          </div>

          <div className="flex flex-wrap gap-2 lg:w-67.5 lg:justify-end">
            <Button
              type="button"
              variant="outline"
              className={cn(
                'rounded-xl border-border bg-background',
                isCopied &&
                  'border-brand-light-blue/20 bg-brand-light-blue/10 text-brand-light-blue'
              )}
              onClick={() => onCopy(shortLink.shortUrl)}
              disabled={isDeleting || isPending}
            >
              {isCopied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>

            <Button
              type="button"
              asChild
              className="rounded-xl bg-brand-light-blue text-brand-dark-blue hover:bg-brand-light-blue/90"
            >
              <a href={shortLink.shortUrl} target="_blank" rel="noreferrer">
                Open
              </a>
            </Button>

            <Button
              type="button"
              variant="destructive"
              className={cn('rounded-xl shadow-none', deleteButtonStyles)}
              onClick={() => onDeleteClick(shortLink)}
              disabled={isDeleting || isPending}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
