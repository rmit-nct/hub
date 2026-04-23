'use client';

import { Eye, EyeOff, Loader2 } from '@ncthub/ui/icons';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';

interface PasswordFormFieldsProps {
  linkId: string;
  slug: string;
  hint: string | null;
}

interface VerifyResponse {
  error?: string;
  url?: string;
}

async function readVerifyResponse(response: Response): Promise<VerifyResponse> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return (await response.json()) as VerifyResponse;
  }

  return {
    error: response.ok
      ? 'The password was verified, but the redirect response was invalid.'
      : 'Could not verify this link right now. Please try again.',
  };
}

export default function PasswordFormFields({
  linkId,
  slug,
  hint,
}: PasswordFormFieldsProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkId,
          slug,
          password,
        }),
      });

      const data = await readVerifyResponse(response);

      if (!response.ok) {
        setError(data.error || 'Incorrect password. Please try again.');
        return;
      }

      if (data.url) {
        router.push(data.url);
      }
    } catch (err) {
      console.error('An error occurred while verifying the password.', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="password"
          className="block font-medium text-foreground/80 text-sm"
        >
          Password
        </label>
        <div className="relative mt-1">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block h-10 w-full rounded-md border border-border px-3 pr-10 shadow-sm focus:border-dynamic-blue focus:outline-none focus:ring-2 focus:ring-dynamic-blue focus:ring-offset-2"
            placeholder="Enter password"
            maxLength={256}
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex h-10 w-10 items-center justify-center text-muted-foreground/60 hover:text-foreground/80"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {hint && (
        <div className="rounded-md bg-dynamic-blue/10 p-3">
          <p className="text-dynamic-blue text-sm">
            <span className="font-medium">Hint:</span> {hint}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-dynamic-red/10 p-3">
          <p className="text-dynamic-red text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !password}
        className="flex h-10 w-full items-center justify-center rounded-md bg-dynamic-blue px-4 font-medium text-white transition-colors hover:bg-dynamic-blue/80 focus:outline-none focus:ring-2 focus:ring-dynamic-blue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying...
          </span>
        ) : (
          'Continue'
        )}
      </button>
    </form>
  );
}
