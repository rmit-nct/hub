'use client';

import { type WorkspaceQuizSet } from '@ncthub/types/db';
import { Button } from '@ncthub/ui/button';
import { Field, FieldLabel, FieldError } from '@ncthub/ui/field';
import { Controller } from '@ncthub/ui/hooks/use-form';
import { useForm } from '@ncthub/ui/hooks/use-form';
import { toast } from '@ncthub/ui/sonner';
import { Input } from '@ncthub/ui/input';
import { zodResolver } from '@ncthub/ui/resolvers';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import * as z from 'zod';

interface Props {
  wsId: string;
  moduleId: string;
  data?: WorkspaceQuizSet;
  // eslint-disable-next-line no-unused-vars
  onFinish?: (data: z.infer<typeof FormSchema>) => void;
}

const FormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  moduleId: z.string(),
});

export default function CourseModuleForm({
  wsId,
  moduleId,
  data,
  onFinish,
}: Props) {
  const t = useTranslations();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    values: {
      id: data?.id,
      name: data?.name || '',
      moduleId,
    },
  });

  const isDirty = form.formState.isDirty;
  const isValid = form.formState.isValid;
  const isSubmitting = form.formState.isSubmitting;

  const disabled = !isDirty || !isValid || isSubmitting;

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const res = await fetch(
        data.id
          ? `/api/v1/workspaces/${wsId}/quiz-sets/${data.id}`
          : `/api/v1/workspaces/${wsId}/quiz-sets`,
        {
          method: data.id ? 'PUT' : 'POST',
          body: JSON.stringify(data),
        }
      );

      if (res.ok) {
        onFinish?.(data);
        router.refresh();
      } else {
        const data = await res.json();
        toast(`Failed to ${data.id ? 'edit' : 'create'} course module`, {
          description: data.message,
        });
      }
    } catch (error) {
      toast(`Failed to ${data.id ? 'edit' : 'create'} course module`, {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('ws-quiz-sets.name')}</FieldLabel>{' '}
            <Input
              placeholder={t('ws-quiz-sets.name')}
              autoComplete="off"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button type="submit" className="w-full" disabled={disabled}>
        {data?.id ? t('ws-quiz-sets.edit') : t('ws-quiz-sets.create')}
      </Button>
    </form>
  );
}
