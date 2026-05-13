import { isValidURL } from '@/utils/url-helper';
import { WorkspaceConfig } from '@ncthub/types/primitives/WorkspaceConfig';
import { Button } from '@ncthub/ui/button';
import { AutosizeTextarea } from '@ncthub/ui/custom/autosize-textarea';
import { Field, FieldLabel, FieldError } from '@ncthub/ui/field';
import { Controller } from '@ncthub/ui/hooks/use-form';
import { useForm } from '@ncthub/ui/hooks/use-form';
import { zodResolver } from '@ncthub/ui/resolvers';
import { useTranslations } from 'next-intl';
import * as z from 'zod';

interface Props {
  data: WorkspaceConfig;
  submitLabel?: string;
  resetMode?: boolean;
  onSubmit: (values: z.infer<typeof FormSchema>) => void;
}

const FormSchema = z
  .object({
    type: z.string(),
    value: z.string().optional(),
  })
  .refine(
    (data) => data.type !== 'URL' || !data.value || isValidURL(data.value),
    {
      message: 'Invalid URL',
    }
  );

export const ConfigFormSchema = FormSchema;

export default function ApiKeyForm({
  data,
  submitLabel,
  resetMode,
  onSubmit,
}: Props) {
  const t = useTranslations('ws-reports');

  const form = useForm({
    resolver: zodResolver(FormSchema),
    values: {
      type: data.type || 'TEXT',
      value: data.value || undefined,
    },
  });

  const isDirty = form.formState.isDirty;
  const isValid = form.formState.isValid;
  const isSubmitting = form.formState.isSubmitting;

  const disabled = !resetMode && (!isDirty || !isValid || isSubmitting);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      {resetMode || (
        <Controller
          control={form.control}
          name="value"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('value')}</FieldLabel>{' '}
              <AutosizeTextarea
                placeholder="Value"
                autoComplete="off"
                maxHeight={200}
                aria-invalid={fieldState.invalid}
                {...field}
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
