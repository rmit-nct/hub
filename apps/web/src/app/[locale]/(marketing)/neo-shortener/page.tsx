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
import { Check, Copy, Link2 } from '@ncthub/ui/icons';
import { Input } from '@ncthub/ui/input';
import { Label } from '@ncthub/ui/label';
import { Textarea } from '@ncthub/ui/textarea';
import { cn } from '@ncthub/utils/format';
import { motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  type CreatedShortLink,
  createShortLink,
  deleteShortLink,
  getMyShortLinksOverview,
} from './functions';
import NeoShortenerHero from './hero';

const SHORT_LINK_LIMIT = 30;
const SHORTENER_LOGIN_URL = `/login?nextUrl=${encodeURIComponent(
  '/neo-shortener'
)}`;

type FetchInput = Parameters<typeof window.fetch>[0];
type FetchInit = Parameters<typeof window.fetch>[1];

function isLogoutRequest(input: FetchInput, init?: FetchInit) {
  let rawUrl = '';
  let method = init?.method;

  if (typeof input === 'string' || input instanceof URL) {
    rawUrl = String(input);
  } else {
    rawUrl = input.url;
    method = method ?? input.method;
  }

  try {
    const url = new URL(rawUrl, window.location.origin);
    return (
      url.pathname === '/api/auth/logout' &&
      (method ?? 'GET').toUpperCase() === 'POST'
    );
  } catch {
    return false;
  }
}

function formatCreatedAt(value: string) {
  return new Date(value).toLocaleString();
}

export default function NeoShortenerPage() {
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [result, setResult] = useState<CreatedShortLink | null>(null);
  const [links, setLinks] = useState<CreatedShortLink[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    const loadLinks = async () => {
      setIsLoadingLinks(true);

      try {
        const overview = await getMyShortLinksOverview();

        if (!cancelled) {
          setLinks(overview.links);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load your short links'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingLinks(false);
        }
      }
    };

    void loadLinks();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args: Parameters<typeof window.fetch>) => {
      const response = await originalFetch(...args);

      if (isLogoutRequest(args[0], args[1]) && response.ok) {
        window.location.assign(SHORTENER_LOGIN_URL);
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const usedCount = links.length;
  const remainingCount = Math.max(SHORT_LINK_LIMIT - usedCount, 0);

  const usagePercent = useMemo(() => {
    return Math.min((usedCount / SHORT_LINK_LIMIT) * 100, 100);
  }, [usedCount]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCopiedValue(null);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('url', url);
    formData.append('customSlug', customSlug);

    startTransition(async () => {
      try {
        const createdLink = await createShortLink(formData);

        setResult(createdLink);
        setLinks((prev) => [createdLink, ...prev]);
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

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedValue(value);

    window.setTimeout(() => {
      setCopiedValue((currentValue) =>
        currentValue === value ? null : currentValue
      );
    }, 2000);
  };

  const handleDelete = async (shortLink: CreatedShortLink) => {
    const confirmed = window.confirm(
      `Delete short link "${shortLink.slug}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setPendingDeleteId(shortLink.id);

    try {
      await deleteShortLink(shortLink.id);

      setLinks((prev) => prev.filter((item) => item.id !== shortLink.id));
      setResult((current) => (current?.id === shortLink.id ? null : current));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete short link'
      );
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <main className="bg-background px-4 py-14">
      <div className="container mx-auto">
        <div className="mx-auto max-w-5xl space-y-8">
          <NeoShortenerHero />

          <div className="mx-auto max-w-4xl space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <Card className="overflow-hidden rounded-[2rem] border-border/60 bg-card/95 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-card/90">
                <CardHeader className="space-y-6 border-b border-border/60 pb-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-brand-light-blue/20 bg-brand-light-blue/10 px-3 py-1 text-sm text-brand-light-blue">
                        <Link2 className="h-4 w-4" />
                        <span className="font-medium">NEO Shortener</span>
                      </div>

                      <div className="flex items-start gap-3">
                        

                        <div className="space-y-1">
                          <CardTitle className="text-xl md:text-2xl">
                            Create a short link
                          </CardTitle>
                          <CardDescription className="max-w-2xl text-sm md:text-base">
                            Paste any destination URL and optionally choose a
                            custom slug to create your short link.
                          </CardDescription>
                        </div>
                      </div>
                    </div>

                    <div className="w-full max-w-[280px] rounded-[1.5rem] border border-brand-light-blue/15 bg-muted/40 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Links left
                          </p>
                          <div className="mt-1 flex items-end gap-2">
                            <span className="font-bold text-3xl text-foreground">
                              {remainingCount}
                            </span>
                            <span className="pb-1 text-sm text-muted-foreground">
                              {remainingCount === 1 ? 'link' : 'links'}
                            </span>
                          </div>
                        </div>

                        <Badge className="rounded-full border border-brand-light-blue/15 bg-brand-light-blue/10 text-brand-light-blue hover:bg-brand-light-blue/10">
                          {usedCount}/{SHORT_LINK_LIMIT} used
                        </Badge>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
  <div
    className="h-full rounded-full bg-brand-light-blue transition-all duration-300"
    style={{ width: `${usagePercent}%` }}
  />
</div>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {usedCount} of {SHORT_LINK_LIMIT} used
                        </span>

                        {usedCount >= SHORT_LINK_LIMIT ? (
                          <span className="font-medium text-dynamic-light-yellow">
                            Limit reached
                          </span>
                        ) : (
                          <span className="text-muted-foreground">30 max</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="url">Destination URL</Label>
                      <Textarea
                        id="url"
                        name="url"
                        placeholder="https://example.com/your-long-url"
                        value={url}
                        onChange={(event) => setUrl(event.target.value)}
                        disabled={isPending || pendingDeleteId !== null}
                        required
                        className="min-h-[120px] rounded-[1.25rem] border-border bg-background text-base shadow-sm placeholder:text-muted-foreground focus-visible:ring-brand-light-blue/25"
                      />
                      <p className="text-sm text-muted-foreground">
                        If you paste `example.com`, it will be stored as
                        `https://example.com`.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customSlug">Custom slug</Label>
                      <Input
                        id="customSlug"
                        name="customSlug"
                        placeholder="leave blank to auto-generate"
                        value={customSlug}
                        onChange={(event) => setCustomSlug(event.target.value)}
                        disabled={isPending || pendingDeleteId !== null}
                        className="h-12 rounded-[1.25rem] border-border bg-background text-base shadow-sm placeholder:text-muted-foreground focus-visible:ring-brand-light-blue/25"
                      />
                      <p className="text-sm text-muted-foreground">
                        Letters, numbers, hyphens, and underscores only.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={
                        isPending ||
                        pendingDeleteId !== null ||
                        usedCount >= SHORT_LINK_LIMIT
                      }
                      className="h-12 w-full rounded-[1.25rem] bg-brand-light-blue font-semibold text-brand-dark-blue shadow-none hover:bg-brand-light-blue/90"
                    >
                      {isPending ? 'Creating short link...' : 'Create short link'}
                    </Button>

                    {usedCount >= SHORT_LINK_LIMIT ? (
                      <div className="rounded-[1.25rem] border border-dynamic-light-yellow/20 bg-dynamic-light-yellow/10 px-4 py-3 text-sm text-foreground">
                        You have reached the {SHORT_LINK_LIMIT}-link limit.
                        Delete an existing link to create a new one.
                      </div>
                    ) : null}
                  </form>

                  {error ? (
                    <div className="rounded-[1.25rem] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {error}
                    </div>
                  ) : null}

                  {result ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Card className="rounded-[1.5rem] border border-brand-light-blue/20 bg-brand-light-blue/5 shadow-none">
                        <CardHeader className="pb-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <CardTitle className="text-base text-foreground">
                                Short link ready
                              </CardTitle>
                              <CardDescription className="mt-1">
                                Stored under domain {result.domain} with slug{' '}
                                {result.slug}.
                              </CardDescription>
                            </div>

                            <Badge className="w-fit rounded-full border border-brand-light-blue/15 bg-brand-light-blue/10 text-brand-light-blue hover:bg-brand-light-blue/10">
                              Saved
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="rounded-[1.25rem] border border-border/60 bg-background/80 p-4">
                            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                              Short URL
                            </p>
                            <a
                              href={result.shortUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="break-all font-semibold text-brand-light-blue hover:underline"
                            >
                              {result.shortUrl}
                            </a>

                            <p className="mt-4 mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                              Destination
                            </p>
                            <p className="break-all text-sm text-foreground">
                              {result.link}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                'rounded-xl border-border bg-background',
                                copiedValue === result.shortUrl &&
                                  'border-brand-light-blue/20 bg-brand-light-blue/10 text-brand-light-blue'
                              )}
                              onClick={() => handleCopy(result.shortUrl)}
                            >
                              {copiedValue === result.shortUrl ? (
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
                              <a
                                href={result.shortUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Open short link
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
            >
              <Card className="rounded-[2rem] border-border/60 bg-card/95 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-card/90">
                <CardHeader className="space-y-3 border-b border-border/60 pb-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">Your short links</CardTitle>
                      <CardDescription>
                        Review, copy, open, or delete the links you have
                        created.
                      </CardDescription>
                    </div>

                    <Badge className="w-fit rounded-full border border-brand-light-blue/15 bg-brand-light-blue/10 text-brand-light-blue hover:bg-brand-light-blue/10">
                      {usedCount} saved
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {isLoadingLinks ? (
                    <div className="rounded-[1.25rem] border border-border/60 bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                      Loading your short links...
                    </div>
                  ) : links.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-border px-6 py-14 text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-light-blue/10 text-brand-light-blue">
                        <Link2 className="h-7 w-7" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold">
                        No short links yet
                      </h3>
                      <p className="mx-auto max-w-md text-sm text-muted-foreground">
                        Create your first short link above. It will appear here
                        so you can copy, open, or delete it later.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {links.map((shortLink, index) => {
                        const isCopied = copiedValue === shortLink.shortUrl;
                        const isDeleting = pendingDeleteId === shortLink.id;

                        return (
                          <motion.div
                            key={shortLink.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.25,
                              delay: Math.min(index * 0.03, 0.18),
                            }}
                            whileHover={{ y: -2 }}
                          >
                            <Card className="rounded-[1.5rem] border-border/60 bg-muted/25 shadow-sm transition-shadow hover:shadow-md">
                              <CardContent className="p-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                  <div className="min-w-0 flex-1 space-y-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge className="rounded-full border border-brand-light-blue/15 bg-brand-light-blue/10 text-brand-light-blue hover:bg-brand-light-blue/10">
                                        {shortLink.slug}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        Created{' '}
                                        {formatCreatedAt(shortLink.createdAt)}
                                      </span>
                                    </div>

                                    <div className="rounded-[1rem] border border-border/60 bg-background p-3">
                                      <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                        Short URL
                                      </p>
                                      <a
                                        href={shortLink.shortUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="break-all font-semibold text-brand-light-blue hover:underline"
                                      >
                                        {shortLink.shortUrl}
                                      </a>
                                    </div>

                                    <div className="rounded-[1rem] border border-border/60 bg-background p-3">
                                      <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                        Destination
                                      </p>
                                      <p className="break-all text-sm text-foreground">
                                        {shortLink.link}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-2 lg:w-[270px] lg:justify-end">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className={cn(
                                        'rounded-xl border-border bg-background',
                                        isCopied &&
                                          'border-brand-light-blue/20 bg-brand-light-blue/10 text-brand-light-blue'
                                      )}
                                      onClick={() =>
                                        handleCopy(shortLink.shortUrl)
                                      }
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
                                      <a
                                        href={shortLink.shortUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        Open
                                      </a>
                                    </Button>
                                    <Button
  type="button"
  variant="destructive"
  className="rounded-xl shadow-none"
  onClick={() => handleDelete(shortLink)}
  disabled={isDeleting || isPending}
>
  {isDeleting ? 'Deleting...' : 'Delete'}
</Button>

                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}