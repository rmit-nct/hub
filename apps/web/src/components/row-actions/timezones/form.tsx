import { Timezone } from '@ncthub/types/primitives/Timezone';
import { Button } from '@ncthub/ui/button';
import { Checkbox } from '@ncthub/ui/checkbox';
import { Field, FieldLabel, FieldError } from '@ncthub/ui/field';
import { Controller } from '@ncthub/ui/hooks/use-form';
import { useForm } from '@ncthub/ui/hooks/use-form';
import { Input } from '@ncthub/ui/input';
import { zodResolver } from '@ncthub/ui/resolvers';
import * as z from 'zod';

interface Props {
  data: Timezone;
  submitLabel?: string;
  onSubmit: (values: z.infer<typeof FormSchema>) => void;
}

const FormSchema = z.object({
  value: z.string().min(1),
  abbr: z.string().min(1),
  offset: z.number(),
  isdst: z.boolean(),
  text: z.string().min(1),
  utc: z.array(z.string().min(1)),
});

export const ApiConfigFormSchema = FormSchema;

export default function TimezoneForm({ data, submitLabel, onSubmit }: Props) {
  const t = (key: string) => key;

  const form = useForm({
    resolver: zodResolver(FormSchema),
    values: {
      value: data.value || '',
      abbr: data.abbr || '',
      offset: data.offset || 0,
      isdst: data.isdst || false,
      text: data.text || '',
      utc: data.utc || [],
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
        name="value"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('value')}</FieldLabel>{' '}
            <Input
              placeholder="Value"
              autoComplete="off"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="abbr"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('abbr')}</FieldLabel>{' '}
            <Input
              placeholder="Abbr"
              autoComplete="off"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="offset"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('offset')}</FieldLabel>{' '}
            <Input
              placeholder="Offset"
              autoComplete="off"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="isdst"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('isdst')}</FieldLabel>{' '}
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="text"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('text')}</FieldLabel>{' '}
            <Input
              placeholder="Text"
              autoComplete="off"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="utc"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('utc')}</FieldLabel>{' '}
            <Input
              placeholder="Utc"
              autoComplete="off"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button type="submit" className="w-full" disabled={disabled}>
        {submitLabel}
      </Button>
    </form>
  );
}
