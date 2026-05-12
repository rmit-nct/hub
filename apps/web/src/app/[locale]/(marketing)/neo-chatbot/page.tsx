import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import NeoChatbotClient from './client';
import NeoChatbotHero from './hero';

export const metadata: Metadata = {
  title: 'Neo Chatbot - Social Media Copywriting Assistant',
  description:
    'A social media copywriting chatbot interface tailored to NCT branding and post format.',
  keywords:
    'social media writer, chatbot, caption generator, club branding, content format, neo chatbot',
};

export default async function NeoChatbotPage() {
  const t = await getTranslations('neo-chatbot');

  const suggestions =
    t('suggestions')
      ?.split('||')
      .map((s: string) => s.trim())
      .filter(Boolean) ?? [];
  const historyItems =
    t('historyItems')
      ?.split('||')
      .map((s: string) => s.trim())
      .filter(Boolean) ?? [];

  return (
    <div className="flex w-full justify-center">
      <div className="container mx-auto max-w-6xl px-4 py-14 lg:py-20">
        <NeoChatbotHero
          badge={t('badge')}
          title={t('title')}
          description={t('description')}
        />

        <div className="mt-12">
          <NeoChatbotClient
            title={t('title')}
            subtitle={t('subtitle')}
            intro={t('intro')}
            helper={t('helper')}
            placeholder={t('placeholder')}
            sendLabel={t('sendLabel')}
            resetLabel={t('resetLabel')}
            statusLabel={t('statusLabel')}
            suggestions={suggestions}
            historyTitle={t('historyTitle')}
            historyIntro={t('historyIntro')}
            newChatLabel={t('newChatLabel')}
            historyItems={historyItems}
          />
        </div>
      </div>
    </div>
  );
}
