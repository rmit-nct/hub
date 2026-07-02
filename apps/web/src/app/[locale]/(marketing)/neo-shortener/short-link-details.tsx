'use client';

interface ShortLinkDetailsProps {
  destinationUrl: string;
  shortUrl: string;
}

export default function ShortLinkDetails({
  destinationUrl,
  shortUrl,
}: ShortLinkDetailsProps) {
  return (
    <>
      <div className="rounded-2xl border border-border/60 bg-background p-3">
        <p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-[0.18em]">
          Short URL
        </p>
        <a
          href={shortUrl}
          target="_blank"
          rel="noreferrer"
          className="break-all font-semibold text-brand-light-blue hover:underline"
        >
          {shortUrl}
        </a>
      </div>

      <div className="rounded-2xl border border-border/60 bg-background p-3">
        <p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-[0.18em]">
          Destination
        </p>
        <p className="break-all text-foreground text-sm">{destinationUrl}</p>
      </div>
    </>
  );
}
