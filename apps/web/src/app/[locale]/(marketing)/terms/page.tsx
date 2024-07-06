import GradientHeadline from '../gradient-headline';
import { getTranslations } from 'next-intl/server';

export default async function TermsPage() {
  const t = await getTranslations('common');

  return (
    <div className="flex h-full w-full items-center justify-center text-2xl font-bold 2xl:text-4xl">
      <GradientHeadline>{t('coming_soon')} ✨</GradientHeadline>
    </div>
  );
}
