'use client';

import { ChatList } from '@/components/chat-list';
import { ChatPanel } from '@/components/chat-panel';
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor';
import { EmptyScreen } from '@/components/empty-screen';
import { Model, defaultModel } from '@/data/models';
import { AIChat } from '@/types/db';
import { createClient } from '@/utils/supabase/client';
import { useChat } from '@ai-sdk/react';
import { toast } from '@repo/ui/hooks/use-toast';
import { cn } from '@repo/ui/lib/utils';
import { Message } from 'ai';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

export interface ChatProps extends React.ComponentProps<'div'> {
  defaultChat?: Partial<AIChat>;
  wsId?: string;
  initialMessages?: Message[];
  previousMessages?: Message[];
  chats?: AIChat[];
  count?: number | null;
  hasKeys: { openAI: boolean; anthropic: boolean; google: boolean };
  locale: string;
}

const Chat = ({
  defaultChat,
  wsId,
  initialMessages,
  previousMessages,
  chats,
  count,
  className,
  hasKeys,
  locale,
}: ChatProps) => {
  const t = useTranslations('ai_chat');

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // const [messages] = useUIState()

  const [chat, setChat] = useState<Partial<AIChat> | undefined>(defaultChat);
  const [model, setModel] = useState<Model | undefined>(defaultModel);

  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      id: chat?.id,
      initialMessages,
      api: model ? `/api/ai/chat/${model.provider.toLowerCase()}` : undefined,
      body: {
        id: chat?.id,
        wsId,
        model: chat?.model || model?.value,
      },
      onResponse(response) {
        if (!response.ok)
          toast({
            title: t('something_went_wrong'),
            description: t('try_again_later'),
          });
      },
      onError(_) {
        toast({
          title: t('something_went_wrong'),
          description: t('try_again_later'),
        });
      },
    });

  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | undefined>(
    chat?.summary || ''
  );

  useEffect(() => {
    setSummary(chat?.summary || '');
    setSummarizing(false);
  }, [chat?.id, messages?.length, chat?.latest_summarized_message_id]);

  useEffect(() => {
    if (!chat || !hasKeys || isLoading) return;

    const generateSummary = async (messages: Message[] = []) => {
      if (
        !wsId ||
        summarizing ||
        !model ||
        !chat?.id ||
        !chat?.model ||
        !messages?.length ||
        chat.latest_summarized_message_id === messages[messages.length - 1]?.id
      )
        return;

      setSummarizing(true);

      const res = await fetch(
        `/api/ai/chat/${model.provider.toLowerCase()}/summary`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            id: chat.id,
            model: chat.model,
          }),
        }
      );

      if (!res.ok) {
        toast({
          title: t('something_went_wrong'),
          description: res.statusText,
        });
        return;
      }

      const { response } = (await res.json()) as { response: string };
      if (response) setSummary(response);
    };

    // Generate the chat summary if the chat's latest summarized message id
    // is not the same as the last message id in the chat
    if (
      wsId &&
      !isLoading &&
      chat.latest_summarized_message_id !== messages[messages.length - 1]?.id &&
      messages[messages.length - 1]?.role !== 'user'
    )
      generateSummary(messages);

    if (messages[messages.length - 1]?.role !== 'user') return;

    // Reload the chat if the user sends a message
    // but the AI did not respond yet after 1 second
    const reloadTimeout = setTimeout(() => {
      if (!wsId || messages[messages.length - 1]?.role !== 'user') return;
      reload();
    }, 1000);

    return () => {
      clearTimeout(reloadTimeout);
    };
  }, [wsId, chat, hasKeys, isLoading, messages, reload]);

  const [initialScroll, setInitialScroll] = useState(true);

  useEffect(() => {
    // if there is "input" in the query string, we will
    // use that as the input for the chat, then remove
    // it from the query string
    const input = searchParams.get('input');
    const refresh = searchParams.get('refresh');

    if (
      (initialScroll || refresh) &&
      !input &&
      !!chats &&
      count !== undefined
    ) {
      setInitialScroll(false);
      const mainChatContent = document.getElementById('main-chat-content');

      if (mainChatContent) {
        const scrollTop = chat?.id ? mainChatContent.scrollTop : 0;
        mainChatContent.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        });
      }
    }

    if (chat?.id && input) {
      setInput(input.toString());
      router.replace(`/${wsId}/chat/${chat.id}`);
    }

    if (refresh) {
      clearChat();
      router.replace(`/${wsId}/chat?`);
    }
  }, [
    chat?.id,
    searchParams,
    router,
    setInput,
    wsId,
    chats,
    count,
    initialScroll,
  ]);

  const [collapsed, setCollapsed] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [input, inputRef]);

  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const createChat = async (input: string) => {
    if (!model) return;

    setPendingPrompt(input);

    const res = await fetch(
      `/api/ai/chat/${model.provider.toLowerCase()}/new`,
      {
        method: 'POST',
        body: JSON.stringify({
          model: model.value,
          message: input,
        }),
      }
    );

    if (!res.ok) {
      toast({
        title: t('something_went_wrong'),
        description: res.statusText,
      });
      return;
    }

    const { id, title } = (await res.json()) as AIChat;
    if (id) {
      setCollapsed(true);
      setChat({ id, title, model: model.value, is_public: false });
      router.replace(`/${wsId}/chat?id=${id}`);
    }
  };

  const updateChat = async (newData: Partial<AIChat>) => {
    if (!chat?.id) return;

    const { is_public } = newData;
    const supabase = createClient();

    const { error } = await supabase
      .from('ai_chats')
      .update({ is_public })
      .eq('id', chat?.id);

    if (error) {
      toast({
        title: t('something_went_wrong'),
        description: error.message,
      });
      return;
    }

    setChat({ ...chat, is_public });
    toast({
      title: t('chat_updated'),
      description: t('visibility_updated_desc'),
    });
  };

  const clearChat = () => {
    if (defaultChat?.id) return;
    setSummary(undefined);
    setChat(undefined);
    setCollapsed(true);
  };

  useEffect(() => {
    if (!pendingPrompt || !chat?.id || !wsId) return;
    append({
      id: chat?.id,
      content: pendingPrompt,
      role: 'user',
    });
    setPendingPrompt(null);
  }, [wsId, pendingPrompt, chat?.id, append]);

  useEffect(() => {
    console.log(pathname);
    if (!pathname.includes('/chat/') && messages.length === 1) {
      window.history.replaceState({}, '', `/${wsId}/chat/${chat?.id}`);
    }
  }, [chat?.id, pathname, messages]);

  return (
    <div className="relative">
      <div className={cn('md:pt-10', wsId ? 'pb-32' : 'pb-4', className)}>
        {(chat && messages.length) || pendingPrompt ? (
          <>
            <ChatList
              chatId={chat?.id}
              chatTitle={chat?.title}
              chatIsPublic={chat?.is_public}
              chatModel={chat?.model}
              chatSummary={summary || chat?.summary}
              summarizing={summarizing}
              messages={
                pendingPrompt
                  ? [
                      {
                        id: 'pending',
                        content: pendingPrompt,
                        role: 'user',
                      },
                    ]
                  : messages.map((message) => {
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
                    })
              }
              setInput={setInput}
              locale={locale}
              model={chat?.model ?? undefined}
              anonymize={!chats || count === undefined}
            />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen
            wsId={wsId}
            chats={chats}
            count={count}
            setInput={setInput}
            previousMessages={previousMessages}
            locale={locale}
          />
        )}
      </div>

      {wsId && (
        <ChatPanel
          id={chat?.id}
          wsId={wsId}
          chat={chat}
          chats={chats}
          count={count}
          isLoading={isLoading}
          stop={stop}
          append={append}
          reload={reload}
          input={input}
          inputRef={inputRef}
          setInput={setInput}
          model={model}
          setModel={setModel}
          messages={messages}
          collapsed={collapsed}
          createChat={createChat}
          updateChat={updateChat}
          clearChat={clearChat}
          setCollapsed={setCollapsed}
          defaultRoute={`/${wsId}/chat`}
        />
      )}
    </div>
  );
};

export default Chat;
