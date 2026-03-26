'use client';

import { Button } from '@ncthub/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ncthub/ui/card';
import { Input } from '@ncthub/ui/input';
import { Label } from '@ncthub/ui/label';
import { Textarea } from '@ncthub/ui/textarea';
import { cn } from '@ncthub/utils/format';
import { Check, Copy, Link2 } from 'lucide-react';
import type React from 'react';
import { useState, useTransition } from 'react';
import { type CreatedShortLink, createShortLink } from './functions';
import NeoShortenerHero from './hero';

export default function NeoShortenerPage() {
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [result, setResult] = useState<CreatedShortLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCopied(false);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('url', url);
    formData.append('customSlug', customSlug);

    startTransition(async () => {
      try {
        const createdLink = await createShortLink(formData);
        setResult(createdLink);
        setUrl('');
        setCustomSlug('');
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : 'Something went wrong while creating your short link'
        );
      }
    });
  };

  const handleCopy = async () => {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="px-4 py-14">
      <div className="container mx-auto">
        <div className="mx-auto max-w-5xl space-y-8">
          <NeoShortenerHero />

          <div className="mx-auto max-w-3xl">
            <Card className="border-border/60 bg-slate-950 text-slate-100 shadow-2xl">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Link2 className="h-5 w-5 text-[#5FC6E5]" />
                  Create a short link
                </CardTitle>
                <CardDescription className="max-w-xl text-slate-300">
                  Paste any destination URL and optionally choose a custom slug
                  to create your short link.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-slate-100">
                      Destination URL
                    </Label>
                    <Textarea
                      id="url"
                      name="url"
                      placeholder="https://example.com/your-long-url"
                      value={url}
                      onChange={(event) => setUrl(event.target.value)}
                      disabled={isPending}
                      required
                      className="min-h-28 resize-none rounded-xl border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500"
                    />
                    <p className="text-slate-400 text-xs">
                      If you paste `example.com`, it will be stored as
                      `https://example.com`.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customSlug" className="text-slate-100">
                      Custom slug
                    </Label>
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <Input
                        id="customSlug"
                        name="customSlug"
                        placeholder="leave blank to auto-generate"
                        value={customSlug}
                        onChange={(event) => setCustomSlug(event.target.value)}
                        disabled={isPending}
                        className="h-11 rounded-xl border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
                      />
                    </div>
                    <p className="text-slate-400 text-xs">
                      Letters, numbers, hyphens, and underscores only.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isPending}
                    className="h-11 w-full rounded-xl bg-[#5FC6E5] font-semibold text-slate-950 hover:bg-[#7bd4ee]"
                  >
                    {isPending ? 'Creating short link...' : 'Create short link'}
                  </Button>
                </form>

                {error ? (
                  <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200 text-sm">
                    {error}
                  </div>
                ) : null}

                {result ? (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-emerald-100 text-sm">
                          Short link created
                        </p>
                        <p className="text-emerald-200/80 text-xs">
                          Stored under domain {result.domain} with slug{' '}
                          {result.slug}.
                        </p>
                      </div>
                      <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-medium text-emerald-100 text-xs">
                        Saved
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                      <p className="mb-2 font-medium text-[11px] text-slate-500 uppercase tracking-[0.22em]">
                        Short URL
                      </p>
                      <a
                        href={result.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all font-semibold text-[#5FC6E5] text-base hover:underline"
                      >
                        {result.shortUrl}
                      </a>

                      <p className="mt-4 mb-2 font-medium text-[11px] text-slate-500 uppercase tracking-[0.22em]">
                        Destination
                      </p>
                      <p className="break-all text-slate-200 text-sm">
                        {result.link}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'rounded-xl border-white/15 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-slate-100',
                          copied && 'border-emerald-400/40 text-emerald-200'
                        )}
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy short URL
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        asChild
                        className="rounded-xl bg-slate-100 text-slate-950 hover:bg-white"
                      >
                        <a
                          href={result.shortUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open short link
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
