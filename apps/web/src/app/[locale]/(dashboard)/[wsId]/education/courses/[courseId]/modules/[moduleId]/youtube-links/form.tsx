'use client';

import { Button } from '@ncthub/ui/button';
import { Field, FieldLabel, FieldError } from '@ncthub/ui/field';
import { Controller } from '@ncthub/ui/hooks/use-form';
import { useForm } from '@ncthub/ui/hooks/use-form';
import { toast } from '@ncthub/ui/hooks/use-toast';
import { Input } from '@ncthub/ui/input';
import { zodResolver } from '@ncthub/ui/resolvers';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import * as z from 'zod';

interface Props {
  wsId: string;
  moduleId: string;
  link?: string;
  links?: string[];
  // eslint-disable-next-line no-unused-vars
  onFinish?: (data: z.infer<typeof FormSchema>) => void;
}

const FormSchema = z.object({
  link: z
    .string()
    .min(1, 'Link is required')
    .regex(
      /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/,
      'Invalid YouTube link'
    ),
});

export default function YouTubeLinkForm({
  wsId,
  moduleId,
  link,
  links,
  onFinish,
}: Props) {
  const t = useTranslations('ws-course-modules');
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    values: {
      link: link || '',
    },
  });

  const isDirty = form.formState.isDirty;
  const isValid = form.formState.isValid;
  const isSubmitting = form.formState.isSubmitting;

  const disabled = !isDirty || !isValid || isSubmitting;

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const res = await fetch(
        `/api/v1/workspaces/${wsId}/course-modules/${moduleId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            youtube_links: [...(links || []), data.link],
          }),
        }
      );

      if (res.ok) {
        onFinish?.(data);
        router.refresh();
      } else {
        const data = await res.json();
        toast({
          title: `Failed to ${link ? 'edit' : 'create'} youtube link`,
          description: data.message,
        });
      }
    } catch (error) {
      toast({
        title: `Failed to ${link ? 'edit' : 'create'} youtube link`,
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
      <Controller
        control={form.control}
        name="link"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('youtube_link')}</FieldLabel>{' '}
            <Input
              placeholder={t('youtube_link')}
              autoComplete="off"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button type="submit" className="w-full" disabled={disabled}>
        {link ? t('edit_link') : t('add_link')}
      </Button>
    </form>
  );
}
