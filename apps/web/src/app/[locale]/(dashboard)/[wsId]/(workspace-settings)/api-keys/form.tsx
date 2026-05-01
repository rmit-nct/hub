import { WorkspaceApiKey } from '@ncthub/types/primitives/WorkspaceApiKey';
import { Button } from '@ncthub/ui/button';
import { Field, FieldLabel, FieldError } from '@ncthub/ui/field';
import { Controller } from '@ncthub/ui/hooks/use-form';
import { useForm } from '@ncthub/ui/hooks/use-form';
import { Input } from '@ncthub/ui/input';
import { zodResolver } from '@ncthub/ui/resolvers';
import { useTranslations } from 'next-intl';
import * as z from 'zod';

interface Props {
  data: WorkspaceApiKey;
  submitLabel?: string;
  onSubmit: (values: z.infer<typeof FormSchema>) => void;
}

const FormSchema = z.object({
  name: z.string().min(1),
  value: z.string().optional(),
});

export const ApiConfigFormSchema = FormSchema;

export default function ApiKeyForm({ data, submitLabel, onSubmit }: Props) {
  const t = useTranslations('ws-api-keys');

  const form = useForm({
    resolver: zodResolver(FormSchema),
    values: {
      name: data.name || '',
      value: data.value || undefined,
    },
  });

  const isDirty = form.formState.isDirty;
  const isValid = form.formState.isValid;
  const isSubmitting = form.formState.isSubmitting;

  const disabled = !isDirty || !isValid || isSubmitting;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('name')}</FieldLabel>{' '}
            <Input
              placeholder="Name"
              autoComplete="off"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {data?.value && (
        <Controller
          control={form.control}
          name="value"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('value')}</FieldLabel>{' '}
              <Input
                placeholder="Value"
                autoComplete="off"
                aria-invalid={fieldState.invalid}
                {...field}
                disabled
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}

      <Button type="submit" className="w-full" disabled={disabled}>
        {submitLabel}
      </Button>
    </form>
  );
}
