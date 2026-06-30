import { ArrowLeft } from '@ncthub/ui/icons';
import { Separator } from '@ncthub/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import LoginForm from './form';

export default async function Login() {
  const t = await getTranslations();

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center p-8">
      <Link
        href="/"
        className="group absolute top-8 left-8 flex items-center rounded-md bg-btn-background px-4 py-2 text-foreground text-sm no-underline hover:bg-btn-background-hover"
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        {t('common.back')}
      </Link>

      <div className="grid gap-2 sm:max-w-md">
        <div className="flex items-center justify-center">
          <h1 className="relative flex w-fit items-center gap-2">
            <Image
              src="/media/logos/transparent.png"
              width={160}
              height={142}
              alt="NCT Hub Logo"
            />
          </h1>
        </div>

        <Suspense fallback={<div>{t('common.loading')}...</div>}>
          <LoginForm />
        </Suspense>

        <Separator className="mt-2" />
        <div className="text-center font-semibold text-foreground/50 text-sm">
          {t('auth.notice-p1')}{' '}
          <Link
            href="https://tuturuuu.com/terms"
            target="_blank"
            className="text-foreground/70 underline decoration-foreground/70 underline-offset-2 transition hover:text-foreground hover:decoration-foreground"
          >
            {t('auth.tos')}
          </Link>{' '}
          {t('common.and')}{' '}
          <Link
            href="https://tuturuuu.com/privacy"
            target="_blank"
            className="text-foreground/70 underline decoration-foreground/70 underline-offset-2 transition hover:text-foreground hover:decoration-foreground"
          >
            {t('auth.privacy')}
          </Link>{' '}
          {t('auth.notice-p2')}.
        </div>
      </div>
    </div>
  );
}
