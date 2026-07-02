'use client';

import { Badge } from '@ncthub/ui/badge';
import { Button } from '@ncthub/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ncthub/ui/card';
import { Check, Copy } from '@ncthub/ui/icons';
import { cn } from '@ncthub/utils/format';
import type { CreatedShortLink } from './functions';
import ShortLinkDetails from './short-link-details';

interface ShortLinkResultCardProps {
  copiedValue: string | null;
  onCopy: (value: string) => void;
  result: CreatedShortLink;
}

export default function ShortLinkResultCard({
  copiedValue,
  onCopy,
  result,
}: ShortLinkResultCardProps) {
  const isCopied = copiedValue === result.shortUrl;

  return (
    <Card className="rounded-3xl border border-brand-light-blue/20 bg-brand-light-blue/5 shadow-none">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base text-foreground">
              Short link ready
            </CardTitle>
            <CardDescription className="mt-1">
              Stored under domain {result.domain} with slug {result.slug}.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            {result.isPasswordProtected ? (
              <Badge className="w-fit rounded-full border border-dynamic-light-yellow/20 bg-dynamic-light-yellow/10 text-dynamic-light-yellow hover:bg-dynamic-light-yellow/10">
                Password protected
              </Badge>
            ) : null}

            <Badge className="w-fit rounded-full border border-brand-light-blue/15 bg-brand-light-blue/10 text-brand-light-blue hover:bg-brand-light-blue/10">
              Saved
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-4 rounded-[1.25rem] border border-border/60 bg-background/80 p-4">
          <ShortLinkDetails
            shortUrl={result.shortUrl}
            destinationUrl={result.link}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className={cn(
              'rounded-xl border-border bg-background',
              isCopied &&
                'border-brand-light-blue/20 bg-brand-light-blue/10 text-brand-light-blue'
            )}
            onClick={() => onCopy(result.shortUrl)}
          >
            {isCopied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy short URL
              </>
            )}
          </Button>

          <Button
            type="button"
            asChild
            className="rounded-xl bg-brand-light-blue text-brand-dark-blue hover:bg-brand-light-blue/90"
          >
            <a href={result.shortUrl} target="_blank" rel="noreferrer">
              Open short link
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
