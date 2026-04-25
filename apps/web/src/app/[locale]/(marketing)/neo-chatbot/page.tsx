import type { Metadata } from 'next';
import NeoChatbotClient from './client';
import NeoChatbotHero from './hero';

export const metadata: Metadata = {
  title: 'Neo Chatbot - Social Media Copywriting Assistant',
  description:
    'A social media copywriting chatbot interface tailored to NCT branding and post format.',
  keywords:
    'social media writer, chatbot, caption generator, club branding, content format, neo chatbot',
};

export default function NeoChatbotPage() {
  return (
    <div className="flex w-full justify-center">
      <div className="container mx-auto max-w-6xl px-4 py-14 lg:py-20">
        <NeoChatbotHero
          badge="Neo Chatbot"
          title="Neo Chatbot"
          description="A social media copywriting assistant designed to generate NCT-style posts based on event recaps and key details."
        />

        <div className="mt-12">
          <NeoChatbotClient
            title="Neo Chatbot"
            subtitle="Social Media Assistant"
            intro=""
            helper="Frontend-only preview."
            placeholder="Paste your event recap details, key achievements, CTA, and member credits..."
            sendLabel="Send"
            resetLabel="Reset"
            statusLabel="Local only"
            suggestions={[
              'Project Management Workshop recap for Instagram',
              'Bilingual recap post for Facebook',
            ]}
            historyTitle="Conversation History"
            historyIntro="Switch between saved social content sessions."
            newChatLabel="New Chat"
            historyItems={[
              'Project Management Workshop recap',
              'Tech sharing event bilingual draft',
              'Member spotlight and contribution credits',
            ]}
          />
        </div>
      </div>
    </div>
  );
}
