'use client';

import { Badge } from '@ncthub/ui/badge';
import { Button } from '@ncthub/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ncthub/ui/card';
import {
  Bot,
  History,
  MessageSquare,
  Plus,
  RefreshCcw,
  Send,
  Sparkles,
  WandSparkles,
} from '@ncthub/ui/icons';
import { ScrollArea } from '@ncthub/ui/scroll-area';
import { Textarea } from '@ncthub/ui/textarea';
import { cn } from '@ncthub/utils/format';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

type ChatRole = 'assistant' | 'user';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

interface NeoChatbotClientProps {
  title: string;
  subtitle: string;
  intro: string;
  helper: string;
  placeholder: string;
  sendLabel: string;
  resetLabel: string;
  statusLabel: string;
  suggestions: string[];
  historyTitle: string;
  historyIntro: string;
  newChatLabel: string;
  historyItems: string[];
}

const starterMessages: ChatMessage[] = [
  {
    id: 'assistant-welcome',
    role: 'assistant',
    content:
      'I am your social content writing assistant for NCT. Share your brief and I will return a post draft in the club format.',
  },
  {
    id: 'user-example',
    role: 'user',
    content:
      'Create an Instagram post for our workshop launch, upbeat tone, with a clear CTA to register.',
  },
  {
    id: 'assistant-example',
    role: 'assistant',
    content:
      'NCT is opening registrations for our hands-on workshop where you will build practical skills with mentors and peers.\n\nSave your seat now via the link in bio.\n\nHashtags: #RMIT #NeoCultureTech #NCTWorkshop',
  },
];

function buildMockReply(prompt: string): string {
  const normalizedPrompt = prompt.toLowerCase();

  if (
    normalizedPrompt.includes('project management') ||
    normalizedPrompt.includes('workshop') ||
    normalizedPrompt.includes('recap')
  ) {
    return "[𝐏𝐫𝐨𝐣𝐞𝐜𝐭 𝐌𝐚𝐧𝐚𝐠𝐞𝐦𝐞𝐧𝐭 𝐖𝐨𝐫𝐤𝐬𝐡𝐨𝐩 𝐑𝐞𝐜𝐚𝐩] 𝐏𝐥𝐚𝐧 𝐬𝐦𝐚𝐫𝐭𝐞𝐫, 𝐄𝐱𝐞𝐜𝐮𝐭𝐞 𝐛𝐞𝐭𝐭𝐞𝐫, 𝐚𝐧𝐝 𝐋𝐞𝐚𝐝 𝐰𝐢𝐭𝐡 𝐜𝐨𝐧𝐟𝐢𝐝𝐞𝐧𝐜𝐞!\n/Vietnamese below/\n\nA big thank you to all members who joined our Project Management Workshop!\n💙Led by Mr. Huỳnh Hoàng Đức, this workshop goes beyond theory, offering practical insights drawn from real experiences in managing and executing both internal and external projects within and beyond NCT. From structuring ideas to planning and delivering outcomes, the workshop highlighted what it really takes to turn concepts into action.\n\n📊What made the session valuable wasn't just the knowledge shared, but how applicable it was. Members had the chance to understand better how to approach projects with clearer thinking, stronger planning, and a more structured workflow — skills that go beyond a single workshop.\n\n📌More importantly, it was a moment for everyone to align, reflect, and strengthen the way we collaborate as teams within NCT.\n\nThank you for being part of the session. See you at the next workshop! 🚀\n#NeoCultureTech #Recap #ProjectManagement\n\n—\n\n[𝐏𝐫𝐨𝐣𝐞𝐜𝐭 𝐌𝐚𝐧𝐚𝐠𝐞𝐦𝐞𝐧𝐭 𝐖𝐨𝐫𝐤𝐬𝐡𝐨𝐩 𝐑𝐞𝐜𝐚𝐩] 𝐏𝐥𝐚𝐧 𝐬𝐦𝐚𝐫𝐭𝐞𝐫, 𝐄𝐱𝐞𝐜𝐮𝐭𝐞 𝐛𝐞𝐭𝐭𝐞𝐫, 𝐚𝐧𝐝 𝐋𝐞𝐚𝐝 𝐰𝐢𝐭𝐡 𝐜𝐨𝐧𝐟𝐢𝐝𝐞𝐧𝐜𝐞!\n\nCảm ơn tất cả các bạn đã tham gia Project Management Workshop!\n💙Được dẫn dắt bởi anh Huỳnh Hoàng Đức, buổi workshop không chỉ dừng lại ở lý thuyết mà còn mang đến những chia sẻ thực tế từ chính trải nghiệm quản lý và triển khai dự án trong và ngoài NCT. Từ việc hình thành ý tưởng đến lập kế hoạch và triển khai, các nội dung đều xoay quanh cách biến ý tưởng thành hành động cụ thể.\n\n📊Giá trị lớn nhất của buổi workshop không chỉ nằm ở kiến thức, mà còn ở tính ứng dụng. Các thành viên đã có thêm góc nhìn rõ ràng hơn về cách tiếp cận dự án, tư duy có hệ thống và kỹ năng lập kế hoạch hiệu quả — những điều có thể áp dụng ngay vào các hoạt động hiện tại và tương lai.\n\n📌Đồng thời, đây cũng là cơ hội để các thành viên cùng nhìn lại và nâng cao cách làm việc, phối hợp trong team tại NCT.\n\nCảm ơn bạn đã tham gia và hẹn gặp lại ở những workshop tiếp theo! 🚀\n#NeoCultureTech #Recap #ProjectManagement\n\n𝐓𝐨 𝐥𝐞𝐚𝐫𝐧 𝐦𝐨𝐫𝐞 𝐚𝐛𝐨𝐮𝐭 𝐮𝐬:\nInstagram: https://www.instagram.com/rmitnct/\nLinkedIn: https://www.linkedin.com/company/rmit-nct/\nWebsite: https://rmitnct.club/\n\nWith contributions from:\nContent: Ngoc Anh";
  }

  if (
    normalizedPrompt.includes('summary') ||
    normalizedPrompt.includes('summarize')
  ) {
    return 'Big update from NCT this week.\n\nWe are shipping key improvements across our student-facing tools and opening new opportunities for members to contribute.\n\nCheck the update thread and drop your preferred contribution area.';
  }

  if (
    normalizedPrompt.includes('friendly') ||
    normalizedPrompt.includes('warm')
  ) {
    return 'Hey NCT fam, something exciting is here.\n\nWe are launching a new initiative designed to make collaboration easier and progress more visible for everyone.\n\nComment if you want early access and we will reach out.';
  }

  if (
    normalizedPrompt.includes('action') ||
    normalizedPrompt.includes('todo')
  ) {
    return 'Ready for next steps?\n\nHere is the rollout checklist for this content push.\n\n1) Finalize visual asset\n2) Approve caption\n3) Publish and monitor comments';
  }

  return 'NCT is building momentum and we want you in.\n\nJoin us this week and tag a friend who should be part of it.';
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex items-end gap-3',
        isAssistant ? 'justify-start' : 'justify-end'
      )}
    >
      {isAssistant && (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border bg-background shadow-sm">
          <Bot className="size-5 text-brand-light-blue" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[82%] rounded-3xl border px-4 py-3 text-sm shadow-sm md:max-w-[72%]',
          isAssistant
            ? 'bg-card/80 text-foreground'
            : 'border-brand-light-orange/40 bg-linear-to-br from-brand-light-orange/15 to-brand-light-yellow/20 text-foreground'
        )}
      >
        <p className="whitespace-pre-wrap leading-6">{message.content}</p>
      </div>

      {!isAssistant && (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-brand-light-orange/40 bg-brand-light-orange/10 shadow-sm">
          <WandSparkles className="size-5 text-brand-light-orange" />
        </div>
      )}
    </div>
  );
}

export default function NeoChatbotClient({
  title,
  subtitle,
  intro,
  helper,
  placeholder,
  sendLabel,
  resetLabel,
  statusLabel,
  suggestions,
  historyTitle,
  historyIntro,
  newChatLabel,
  historyItems,
}: NeoChatbotClientProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(
    historyItems[0] ?? 'conversation-1'
  );
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    const trimmedDraft = draft.trim();

    if (!trimmedDraft || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedDraft,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setDraft('');
    setIsSending(true);

    window.requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });

    timerRef.current = window.setTimeout(() => {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: buildMockReply(trimmedDraft),
        },
      ]);
      setIsSending(false);

      window.requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }, 500);
  };

  const handleReset = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setMessages(starterMessages);
    setDraft('');
    setIsSending(false);

    window.requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  };

  const handleStartNewChat = () => {
    setActiveConversationId(`new-${Date.now()}`);
    handleReset();
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    handleReset();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.45fr]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="size-5 text-brand-light-blue" />
              <CardTitle className="text-lg">{historyTitle}</CardTitle>
            </div>
            <CardDescription>{historyIntro}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start bg-linear-to-r from-brand-light-orange to-brand-light-yellow font-semibold text-primary-foreground"
              onClick={handleStartNewChat}
            >
              <Plus className="size-4" />
              {newChatLabel}
            </Button>

            <div className="space-y-2">
              {historyItems.map((item, index) => {
                const conversationId = `conversation-${index}`;
                const isActive =
                  activeConversationId === conversationId &&
                  messages.length > 0;

                return (
                  <Button
                    key={conversationId}
                    variant="outline"
                    className={cn(
                      'h-auto w-full justify-start whitespace-normal rounded-2xl px-3 py-3 text-left',
                      isActive &&
                        'border-brand-light-blue/40 bg-brand-light-blue/10 text-foreground'
                    )}
                    onClick={() => handleSelectConversation(conversationId)}
                  >
                    <span className="mr-2 inline-flex size-7 items-center justify-center rounded-full bg-brand-light-blue/10 text-brand-light-blue">
                      <MessageSquare className="size-4" />
                    </span>
                    <span>{item}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-border/70 bg-card/80 shadow-lg backdrop-blur-sm">
          <CardHeader className="border-b bg-background/30 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                  <Sparkles className="size-5 text-brand-light-yellow" />
                  {title}
                </CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-sm md:text-base">
                  {subtitle}
                </CardDescription>
              </div>

              <Badge
                variant="outline"
                className="border-brand-light-blue/50 bg-brand-light-blue/10 px-3 py-1 text-brand-light-blue"
              >
                {statusLabel}
              </Badge>
            </div>

            <p className="text-muted-foreground text-sm">{intro}</p>
          </CardHeader>

          <CardContent className="space-y-4 p-4 md:p-6">
            <ScrollArea className="h-130 pr-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ChatBubble message={message} />
                  </motion.div>
                ))}

                {isSending && (
                  <div className="flex items-end gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border bg-background shadow-sm">
                      <Bot className="size-5 text-brand-light-blue" />
                    </div>
                    <div className="rounded-3xl border bg-card/80 px-4 py-3 text-muted-foreground text-sm shadow-sm">
                      Thinking...
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            <div className="rounded-3xl border bg-background/70 p-4 shadow-sm">
              <div className="mb-4 grid gap-2 sm:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    className="h-auto justify-start whitespace-normal rounded-2xl px-3 py-3 text-left text-sm"
                    onClick={() => setDraft(suggestion)}
                  >
                    <span className="mr-2 inline-flex size-7 items-center justify-center rounded-full bg-brand-light-orange/10 text-brand-light-orange">
                      <Sparkles className="size-4" />
                    </span>
                    <span>{suggestion}</span>
                  </Button>
                ))}
              </div>

              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={placeholder}
                className="min-h-30 resize-none border-none bg-transparent px-0 py-0 text-base shadow-none focus-visible:ring-0"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted-foreground text-sm">{helper}</p>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleReset}>
                    <RefreshCcw className="size-4" />
                    {resetLabel}
                  </Button>
                  <Button
                    className="bg-linear-to-r from-brand-light-orange to-brand-light-yellow font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
                    onClick={handleSend}
                    disabled={!draft.trim() || isSending}
                  >
                    {sendLabel}
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
