'use client';

import React, { useState, useTransition } from 'react';
import { createShortLink } from './functions';

export default function ShortenerForm() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<null | {
    id: string;
    link: string;
    slug: string;
  }>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('url', url);

    startTransition(async () => {
      try {
        const res = await createShortLink(formData);
        setResult(res);
        setUrl('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  };

  const shortUrl = result
    ? `${process.env.NEXT_PUBLIC_APP_URL}/${result.slug}`
    : null;

  return (
    <div className="w-full max-w-xl space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          placeholder="Paste your long URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="flex-1 rounded-xl border px-4 py-2"
        />

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isPending ? 'Shortening...' : 'Shorten'}
        </button>
      </form>

      {error && <div className="text-sm text-red-500">{error}</div>}

      {shortUrl && (
        <div className="space-y-2 rounded-xl border p-4">
          <p className="text-sm text-gray-500">Your short link:</p>

          <div className="flex items-center justify-between gap-2">
            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-blue-600"
            >
              {shortUrl}
            </a>

            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(shortUrl)}
              className="rounded border px-2 py-1 text-sm"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
