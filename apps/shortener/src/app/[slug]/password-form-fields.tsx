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
          className="block font-medium text-sm text-white/78"
        >
          Password
        </label>
        <div className="relative mt-1">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            suppressHydrationWarning
            className="block h-12 w-full rounded-2xl border border-white/10 bg-[#171a2b] px-4 pr-11 text-base text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] placeholder:text-white/34 focus:border-brand-light-blue/45 focus:outline-none focus:ring-4 focus:ring-brand-light-blue/15"
            placeholder="Enter password"
            maxLength={256}
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex h-12 w-12 items-center justify-center text-white/42 transition-colors hover:text-brand-light-blue"
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
        <div className="rounded-2xl border border-brand-light-blue/16 bg-brand-light-blue/10 p-3.5">
          <p className="text-brand-light-blue/90 text-sm">
            <span className="font-medium">Hint:</span> {hint}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-500/18 bg-rose-500/10 p-3.5">
          <p className="text-rose-200 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !password}
        className="flex h-12 w-full items-center justify-center rounded-2xl border border-brand-light-blue/10 bg-brand-light-blue px-4 font-semibold text-brand-dark-blue transition-all duration-200 hover:bg-[#9fe6ff] focus:outline-none focus:ring-4 focus:ring-brand-light-blue/20 disabled:cursor-not-allowed disabled:border-white/8 disabled:bg-white/12 disabled:text-white/45 disabled:opacity-100"
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
