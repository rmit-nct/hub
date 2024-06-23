import { ChatList } from './chat-list';
import { capitalize, cn } from '@/lib/utils';
import { AIChat } from '@/types/db';
import { Button } from '@repo/ui/components/ui/button';
import { IconArrowRight } from '@repo/ui/components/ui/icons';
import { Separator } from '@repo/ui/components/ui/separator';
import { Message } from 'ai';
import { UseChatHelpers } from 'ai/react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Box, Globe, Lock, MessageCircle, Sparkle } from 'lucide-react';
import { useTheme } from 'next-themes';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';

export function EmptyScreen({
  wsId,
  chats,
  count,
  setInput,
  previousMessages,
  locale,
}: Pick<UseChatHelpers, 'setInput'> & {
  wsId?: string;
  chats?: AIChat[];
  count?: number | null;
  previousMessages?: Message[];
  locale: string;
}) {
  dayjs.extend(relativeTime);
  dayjs.locale(locale);

  const { t } = useTranslation('ai-chat');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme?.includes('dark');

  const exampleMessages = [
    {
      heading: t('example_1'),
      message: t('example_1_prompt'),
    },
    {
      heading: t('example_2'),
      message: t('example_2_prompt'),
    },
    {
      heading: t('example_3'),
      message: t('example_3_prompt'),
    },
    {
      heading: t('example_4'),
      message: t('example_4_prompt'),
    },
    {
      heading: t('example_5'),
      message: t('example_5_prompt'),
    },
  ];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 lg:max-w-4xl xl:max-w-6xl">
      <div className="bg-background rounded-lg border p-4 md:p-8">
        <h1 className="mb-2 text-lg font-semibold">
          {t('welcome_to')}{' '}
          <span
            className={`overflow-hidden bg-gradient-to-r bg-clip-text font-bold text-transparent ${
              isDark
                ? 'from-pink-300 via-amber-300 to-blue-300'
                : 'from-pink-600 via-yellow-500 to-sky-600'
            }`}
          >
            Tuturuuu AI
          </span>{' '}
          Chat.
        </h1>
        <p className="text-foreground/90 text-sm leading-normal md:text-base">
          {t('welcome_msg')}
        </p>

        <div className="mt-4 flex w-fit max-w-full flex-col gap-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto w-fit max-w-full p-0 text-left justify-start text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="text-foreground/80 mr-2 shrink-0" />
              <div className="w-fit max-w-full truncate">{message.heading}</div>
            </Button>
          ))}
        </div>

        {chats && chats.length > 0 && (
          <>
            <Separator className="my-4" />
            <div>
              <h2 className="line-clamp-1 text-lg font-semibold">
                {t('recent_conversations')}
              </h2>
              <div className="mt-4 flex flex-col items-start space-y-2">
                {chats.slice(0, 5).map((chat) => (
                  <div key={chat.id} className="flex w-full items-center gap-2">
                    <MessageCircle className="text-foreground/80 shrink-0" />
                    <div className="flex w-full flex-col items-start">
                      <Link
                        href={`/${wsId}/chat/${chat.id}`}
                        className="text-sm md:text-base hover:underline"
                      >
                        {chat.title}
                      </Link>

                      <div className="text-xs mt-1 flex flex-wrap gap-1 items-center">
                        <span
                          className={cn(
                            'lowercase inline-flex items-center gap-1 font-semibold font-mono px-1 py-0.5 border rounded',
                            chat.is_public
                              ? 'bg-dynamic-green/10 text-dynamic-green border-dynamic-green/20'
                              : 'bg-dynamic-red/10 text-dynamic-red border-dynamic-red/20'
                          )}
                        >
                          {chat.is_public ? (
                            <>
                              <Globe className="w-3 h-3" />
                              {t('public')}
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              {t('only_me')}
                            </>
                          )}
                        </span>
                        {chat.model && (
                          <span className="lowercase font-semibold inline-flex items-center gap-1 font-mono px-1 py-0.5 border rounded bg-dynamic-yellow/10 text-dynamic-yellow border-dynamic-yellow/20">
                            <Sparkle className="w-3 h-3" />
                            {chat.model}
                          </span>
                        )}
                        {chat.summary && (
                          <span className="lowercase font-semibold inline-flex items-center gap-1 font-mono px-1 py-0.5 border rounded bg-dynamic-purple/10 text-dynamic-purple border-dynamic-purple/20">
                            <Box className="w-3 h-3" />
                            {t('summarized')}
                          </span>
                        )}
                        <span className="opacity-70">
                          {chat.model && <span className="mr-1">•</span>}
                          {capitalize(dayjs(chat?.created_at).fromNow())}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {previousMessages && previousMessages.length > 0 && (
        <div className="bg-background rounded-lg border p-4 md:p-8">
          <div>
            <h2 className="line-clamp-1 text-lg font-semibold">
              {t('latest_messages')}
            </h2>
            <Separator className="mb-8 mt-4" />
            <div className="flex flex-col items-start space-y-2">
              <ChatList
                messages={previousMessages.map((message) => {
                  // If there is 2 repeated substring in the
                  // message, we will merge them into one
                  const content = message.content;
                  const contentLength = content.length;
                  const contentHalfLength = Math.floor(contentLength / 2);

                  const firstHalf = content.substring(0, contentHalfLength);

                  const secondHalf = content.substring(
                    contentHalfLength,
                    contentLength
                  );

                  if (firstHalf === secondHalf) message.content = firstHalf;
                  return message;
                })}
                setInput={setInput}
                embeddedUrl={`/${wsId}/chat`}
                locale={locale}
              />
            </div>
          </div>
        </div>
      )}

      {chats && chats.length > 5 && (
        <div className="bg-background rounded-lg border p-4 md:p-8">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">
              {t('all_conversations')}{' '}
              {count ? (
                <span className="bg-foreground/10 text-foreground rounded-full border px-2 py-0.5 text-sm">
                  {count}
                </span>
              ) : (
                ''
              )}
            </h2>

            <Separator className="mb-8 mt-4" />

            <div className="flex flex-col items-start space-y-2">
              {chats.map((chat) => (
                <div key={chat.id} className="flex w-full items-center gap-2">
                  <MessageCircle className="text-foreground/80 shrink-0" />
                  <div className="flex w-full flex-col items-start">
                    <Link
                      href={`/${wsId}/chat/${chat.id}`}
                      className="text-sm md:text-base hover:underline"
                    >
                      {chat.title}
                    </Link>

                    <div className="text-xs mt-1 flex flex-wrap gap-1 items-center">
                      <span
                        className={cn(
                          'lowercase inline-flex items-center gap-1 font-semibold font-mono px-1 py-0.5 border rounded',
                          chat.is_public
                            ? 'bg-dynamic-green/10 text-dynamic-green border-dynamic-green/20'
                            : 'bg-dynamic-red/10 text-dynamic-red border-dynamic-red/20'
                        )}
                      >
                        {chat.is_public ? (
                          <>
                            <Globe className="w-3 h-3" />
                            {t('public')}
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            {t('only_me')}
                          </>
                        )}
                      </span>
                      {chat.model && (
                        <span className="lowercase font-semibold inline-flex items-center gap-1 font-mono px-1 py-0.5 border rounded bg-dynamic-yellow/10 text-dynamic-yellow border-dynamic-yellow/20">
                          <Sparkle className="w-3 h-3" />
                          {chat.model}
                        </span>
                      )}
                      {chat.summary && (
                        <span className="lowercase font-semibold inline-flex items-center gap-1 font-mono px-1 py-0.5 border rounded bg-dynamic-purple/10 text-dynamic-purple border-dynamic-purple/20">
                          <Box className="w-3 h-3" />
                          {t('summarized')}
                        </span>
                      )}
                      <span className="opacity-70">
                        {chat.model && <span className="mr-1">•</span>}
                        {capitalize(dayjs(chat?.created_at).fromNow())}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
