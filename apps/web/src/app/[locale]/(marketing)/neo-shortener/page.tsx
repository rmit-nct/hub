'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ncthub/ui/alert-dialog';
import { Badge } from '@ncthub/ui/badge';
import { Button } from '@ncthub/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ncthub/ui/card';
import { Eye, EyeOff, Link2, Lock, Trash2 } from '@ncthub/ui/icons';
import { Input } from '@ncthub/ui/input';
import { Label } from '@ncthub/ui/label';
import { toast } from '@ncthub/ui/sonner';
import { Switch } from '@ncthub/ui/switch';
import { Textarea } from '@ncthub/ui/textarea';
import { cn } from '@ncthub/utils/format';
import { motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  type CreatedShortLink,
  checkShortLinkSlugAvailability,
  createShortLink,
  deleteShortLink,
  getMyShortLinksOverview,
} from './functions';
import NeoShortenerHero from './hero';
import ShortLinkListCard from './short-link-list-card';
import ShortLinkResultCard from './short-link-result-card';
import { isLogoutRequest } from './shortener-utils';
import {
  SlugAvailabilityFeedback,
  type SlugAvailabilityState,
} from './slug-availability';

const SHORT_LINK_LIMIT = 30;
const SHORTENER_LOGIN_URL = `/login?nextUrl=${encodeURIComponent(
  '/neo-shortener'
)}`;
const SLUG_AVAILABILITY_DELAY = 500;
const SHORTENER_DELETE_BUTTON_STYLES =
  'border border-rose-500/35 bg-rose-500/85 text-white hover:border-rose-400/45 hover:bg-rose-500 active:bg-rose-600 focus-visible:ring-rose-300/35';
const SHORTENER_DELETE_CONFIRM_STYLES =
  'border border-rose-500/24 bg-rose-500/18 text-rose-50 hover:border-rose-500/32 hover:bg-rose-500/24 active:bg-rose-500/30 focus-visible:ring-rose-300/25';
const SHORTENER_DANGER_ACCENT_STYLES =
  'border-rose-500/25 bg-rose-500/12 text-rose-600';

export default function NeoShortenerPage() {
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordHint, setPasswordHint] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState<CreatedShortLink | null>(null);
  const [links, setLinks] = useState<CreatedShortLink[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [linkToDelete, setLinkToDelete] = useState<CreatedShortLink | null>(
    null
  );
  const [slugAvailability, setSlugAvailability] =
    useState<SlugAvailabilityState | null>(null);
  const [isPending, startTransition] = useTransition();

  const trimmedCustomSlug = customSlug.trim();

  useEffect(() => {
    let cancelled = false;

    const loadLinks = async () => {
      setIsLoadingLinks(true);

      try {
        const overview = await getMyShortLinksOverview();

        if (!cancelled) {
          setIsAuthenticated(overview.isAuthenticated);
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
    if (!trimmedCustomSlug) {
      setSlugAvailability(null);
      return;
    }

    let cancelled = false;

    setSlugAvailability({
      available: false,
      message: 'Checking slug availability...',
      slug: trimmedCustomSlug,
      status: 'checking',
    });

    const timeoutId = window.setTimeout(() => {
      void checkShortLinkSlugAvailability(trimmedCustomSlug)
        .then((availability) => {
          if (!cancelled) {
            setSlugAvailability(availability);
          }
        })
        .catch((availabilityError) => {
          console.error(availabilityError);

          if (!cancelled) {
            setSlugAvailability({
              available: false,
              message:
                'Could not check this slug right now. You can try again soon.',
              slug: trimmedCustomSlug,
              status: 'error',
            });
          }
        });
    }, SLUG_AVAILABILITY_DELAY);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [trimmedCustomSlug]);

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
  const slugAvailabilityMatchesInput =
    !trimmedCustomSlug || slugAvailability?.slug === trimmedCustomSlug;
  const currentSlugAvailability = slugAvailabilityMatchesInput
    ? slugAvailability
    : null;
  const isSlugBlockingSubmit =
    (trimmedCustomSlug.length > 0 && !slugAvailabilityMatchesInput) ||
    currentSlugAvailability?.status === 'checking' ||
    currentSlugAvailability?.status === 'invalid' ||
    currentSlugAvailability?.status === 'taken';
  const isPasswordBlockingSubmit = isPasswordProtected && !password;

  const usagePercent = useMemo(() => {
    return Math.min((usedCount / SHORT_LINK_LIMIT) * 100, 100);
  }, [usedCount]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCopiedValue(null);
    setError(null);
    setResult(null);

    if (isAuthenticated === false) {
      toast('Login required', {
        description:
          'Please log in to create, save, and manage your short links.',
        action: {
          label: 'Login',
          onClick: () => window.location.assign(SHORTENER_LOGIN_URL),
        },
      });
      return;
    }

    if (isSlugBlockingSubmit) {
      setError(
        currentSlugAvailability?.message ||
          'Please wait for the custom slug check to finish'
      );
      return;
    }

    if (isPasswordBlockingSubmit) {
      setError('Add a password or turn off password protection');
      return;
    }

    const formData = new FormData();
    formData.append('url', url);
    formData.append('customSlug', customSlug);
    formData.append('password', isPasswordProtected ? password : '');
    formData.append('passwordHint', isPasswordProtected ? passwordHint : '');

    startTransition(async () => {
      try {
        const createdLink = await createShortLink(formData);

        setResult(createdLink);
        setLinks((prev) => [createdLink, ...prev]);
        setUrl('');
        setCustomSlug('');
        setIsPasswordProtected(false);
        setPassword('');
        setPasswordHint('');
        setShowPassword(false);
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
      setLinkToDelete((current) =>
        current?.id === shortLink.id ? null : current
      );
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
              <Card className="overflow-hidden rounded-4xl border-border/60 bg-card/95 shadow-xl backdrop-blur supports-backdrop-filter:bg-card/90">
                <CardHeader className="space-y-6 border-border/60 border-b pb-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-brand-light-blue/20 bg-brand-light-blue/10 px-3 py-1 text-brand-light-blue text-sm">
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

                    <div className="w-full max-w-70 rounded-3xl border border-brand-light-blue/15 bg-muted/40 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Links left
                          </p>
                          <div className="mt-1 flex items-end gap-2">
                            <span className="font-bold text-3xl text-foreground">
                              {remainingCount}
                            </span>
                            <span className="pb-1 text-muted-foreground text-sm">
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
                        className="min-h-30 rounded-[1.25rem] border-border bg-background text-base shadow-sm placeholder:text-muted-foreground focus-visible:ring-brand-light-blue/25"
                      />
                      <p className="text-muted-foreground text-sm">
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
                        aria-describedby="customSlug-status"
                        onChange={(event) => {
                          setCustomSlug(event.target.value);
                          setError(null);
                        }}
                        disabled={isPending || pendingDeleteId !== null}
                        className="h-12 rounded-[1.25rem] border-border bg-background text-base shadow-sm placeholder:text-muted-foreground focus-visible:ring-brand-light-blue/25"
                      />
                      <div className="min-h-5">
                        <SlugAvailabilityFeedback
                          availability={currentSlugAvailability}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-[1.25rem] border border-border/60 bg-muted/25 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-brand-light-blue" />
                            <Label htmlFor="passwordProtection">
                              Password protection
                            </Label>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            Require a password before visitors can open this
                            short link.
                          </p>
                        </div>

                        <Switch
                          id="passwordProtection"
                          checked={isPasswordProtected}
                          onCheckedChange={(checked) => {
                            setIsPasswordProtected(checked);
                            setError(null);

                            if (!checked) {
                              setPassword('');
                              setPasswordHint('');
                              setShowPassword(false);
                            }
                          }}
                          disabled={isPending || pendingDeleteId !== null}
                          aria-label="Toggle password protection"
                        />
                      </div>

                      {isPasswordProtected ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                              <Input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(event) => {
                                  setPassword(event.target.value);
                                  setError(null);
                                }}
                                placeholder="Enter a password"
                                maxLength={256}
                                required={isPasswordProtected}
                                disabled={isPending || pendingDeleteId !== null}
                                className="h-12 rounded-[1.25rem] border-border bg-background pr-11 text-base shadow-sm placeholder:text-muted-foreground focus-visible:ring-brand-light-blue/25"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowPassword(
                                    (currentValue) => !currentValue
                                  )
                                }
                                disabled={isPending || pendingDeleteId !== null}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label={
                                  showPassword
                                    ? 'Hide password'
                                    : 'Show password'
                                }
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="passwordHint">Password hint</Label>
                            <Input
                              id="passwordHint"
                              name="passwordHint"
                              value={passwordHint}
                              onChange={(event) => {
                                setPasswordHint(event.target.value);
                                setError(null);
                              }}
                              placeholder="optional"
                              maxLength={200}
                              disabled={isPending || pendingDeleteId !== null}
                              className="h-12 rounded-[1.25rem] border-border bg-background text-base shadow-sm placeholder:text-muted-foreground focus-visible:ring-brand-light-blue/25"
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={
                        isPending ||
                        pendingDeleteId !== null ||
                        isSlugBlockingSubmit ||
                        isPasswordBlockingSubmit ||
                        usedCount >= SHORT_LINK_LIMIT
                      }
                      className="h-12 w-full rounded-[1.25rem] bg-brand-light-blue font-semibold text-brand-dark-blue shadow-none hover:bg-brand-light-blue/90"
                    >
                      {isPending
                        ? 'Creating short link...'
                        : 'Create short link'}
                    </Button>

                    {usedCount >= SHORT_LINK_LIMIT ? (
                      <div className="rounded-[1.25rem] border border-dynamic-light-yellow/20 bg-dynamic-light-yellow/10 px-4 py-3 text-foreground text-sm">
                        You have reached the {SHORT_LINK_LIMIT}-link limit.
                        Delete an existing link to create a new one.
                      </div>
                    ) : null}
                  </form>

                  {error ? (
                    <div
                      className={cn(
                        'rounded-[1.25rem] px-4 py-3 text-sm',
                        SHORTENER_DANGER_ACCENT_STYLES
                      )}
                    >
                      {error}
                    </div>
                  ) : null}

                  {result ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ShortLinkResultCard
                        result={result}
                        copiedValue={copiedValue}
                        onCopy={handleCopy}
                      />
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
              <Card className="rounded-4xl border-border/60 bg-card/95 shadow-xl backdrop-blur supports-backdrop-filter:bg-card/90">
                <CardHeader className="space-y-3 border-border/60 border-b pb-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">
                        Your short links
                      </CardTitle>
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
                    <div className="rounded-[1.25rem] border border-border/60 bg-muted/40 px-4 py-8 text-center text-muted-foreground text-sm">
                      Loading your short links...
                    </div>
                  ) : links.length === 0 ? (
                    <div className="rounded-3xl border border-border border-dashed px-6 py-14 text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-light-blue/10 text-brand-light-blue">
                        <Link2 className="h-7 w-7" />
                      </div>
                      <h3 className="mb-2 font-semibold text-lg">
                        No short links yet
                      </h3>
                      <p className="mx-auto max-w-md text-muted-foreground text-sm">
                        Create your first short link above. It will appear here
                        so you can copy, open, or delete it later.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {links.map((shortLink, index) => {
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
                            <ShortLinkListCard
                              shortLink={shortLink}
                              copiedValue={copiedValue}
                              isDeleting={isDeleting}
                              isPending={isPending}
                              onCopy={handleCopy}
                              onDeleteClick={setLinkToDelete}
                              deleteButtonStyles={
                                SHORTENER_DELETE_BUTTON_STYLES
                              }
                            />
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
      <AlertDialog
        open={Boolean(linkToDelete)}
        onOpenChange={(open) => {
          if (!open && !pendingDeleteId) {
            setLinkToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-400" />
              Delete short link
            </AlertDialogTitle>
            <AlertDialogDescription>
              {linkToDelete
                ? `Delete "${linkToDelete.slug}" permanently? This will remove the short URL and its access history from your dashboard.`
                : 'Delete this short link permanently?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(pendingDeleteId)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => linkToDelete && handleDelete(linkToDelete)}
              disabled={!linkToDelete || Boolean(pendingDeleteId)}
              className={SHORTENER_DELETE_CONFIRM_STYLES}
            >
              {pendingDeleteId ? 'Deleting...' : 'Delete link'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
