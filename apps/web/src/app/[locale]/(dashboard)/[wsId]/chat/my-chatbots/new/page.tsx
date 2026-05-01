'use client';

import { Button } from '@ncthub/ui/button';
import FeatureSummary from '@ncthub/ui/custom/feature-summary';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@ncthub/ui/field';
import { Controller } from '@ncthub/ui/hooks/use-form';
import { useForm } from '@ncthub/ui/hooks/use-form';
import { toast } from '@ncthub/ui/hooks/use-toast';
import { zodResolver } from '@ncthub/ui/resolvers';
import { Textarea } from '@ncthub/ui/textarea';
import { useTranslations } from 'next-intl';
import { use } from 'react';
import { z } from 'zod';

const FormSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Name must be at least 3 characters.' })
    .max(50, { message: 'Name must not be longer than 50 characters.' }),
  purpose: z
    .string()
    .min(20, { message: 'Purpose must be at least 20 characters.' })
    .max(500, { message: 'Purpose must not be longer than 500 characters.' }),
  personality: z
    .string()
    .min(20, { message: 'Personality must be at least 20 characters.' })
    .max(500, {
      message: 'Personality must not be longer than 500 characters.',
    }),
  expertise: z
    .string()
    .min(20, { message: 'Expertise must be at least 20 characters.' })
    .max(500, { message: 'Expertise must not be longer than 500 characters.' }),
  rules: z
    .string()
    .min(20, { message: 'Rules must be at least 20 characters.' })
    .max(1000, { message: 'Rules must not be longer than 1000 characters.' }),
  exampleConversation: z
    .string()
    .min(50, {
      message: 'Example conversation must be at least 50 characters.',
    })
    .max(2000, {
      message: 'Example conversation must not be longer than 2000 characters.',
    }),
});

interface Props {
  params: Promise<{
    wsId: string;
  }>;
}

export default function WorkspaceUserGroupTagsPage({ params }: Props) {
  const t = useTranslations();

  const { wsId } = use(params);
  console.log(wsId);

  const form = useForm({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <div className="grid gap-4">
      <FeatureSummary
        pluralTitle={t('ai_chat.new_chatbot')}
        description={t('ai_chat.my_chatbots_description')}
      />
      <div className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-foreground/5 p-6 md:flex-row md:items-start">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-8"
        >
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Chatbot Name</FieldLabel>{' '}
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder="e.g., Marketing Assistant, Code Review Expert"
                  {...field}
                />
                <FieldDescription>
                  Choose a name that reflects your chatbot's primary function.
                </FieldDescription>
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="purpose"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Primary Purpose</FieldLabel>{' '}
                <Textarea
                  placeholder="Describe the main tasks and objectives this chatbot should accomplish..."
                  className="min-h-[100px]"
                  {...field}
                />
                <FieldDescription>
                  Clearly define what problems this chatbot will solve or tasks
                  it will help with.
                </FieldDescription>
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="personality"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Personality & Communication Style</FieldLabel>{' '}
                <Textarea
                  placeholder="Describe how the chatbot should interact and communicate..."
                  className="min-h-[100px]"
                  {...field}
                />
                <FieldDescription>
                  Define the tone, style, and personality traits (e.g.,
                  professional, friendly, technical, casual).
                </FieldDescription>
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="expertise"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Knowledge & Expertise</FieldLabel>{' '}
                <Textarea
                  placeholder="Specify the domains, topics, or skills the chatbot should be knowledgeable about..."
                  className="min-h-[100px]"
                  {...field}
                />
                <FieldDescription>
                  List specific areas of expertise, technical knowledge, or
                  subject matter the chatbot should focus on.
                </FieldDescription>
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="rules"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Rules & Constraints</FieldLabel>{' '}
                <Textarea
                  placeholder="List any specific rules, limitations, or guidelines the chatbot should follow..."
                  className="min-h-[100px]"
                  {...field}
                />
                <FieldDescription>
                  Define boundaries, ethical guidelines, and specific behaviors
                  to avoid.
                </FieldDescription>
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="exampleConversation"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Example Conversations</FieldLabel>{' '}
                <Textarea
                  placeholder="Provide example interactions between users and the chatbot..."
                  className="min-h-[150px]"
                  {...field}
                />
                <FieldDescription>
                  Add sample dialogues showing ideal interactions and how the
                  chatbot should handle different scenarios.
                </FieldDescription>
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          <Button type="submit" className="w-full">
            Create Chatbot
          </Button>
        </form>
      </div>
    </div>
  );
}
