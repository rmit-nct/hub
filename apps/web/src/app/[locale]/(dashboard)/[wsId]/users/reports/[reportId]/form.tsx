import { UserReportFormSchema } from './editable-report-preview';
import { Button } from '@ncthub/ui/button';
import { AutosizeTextarea } from '@ncthub/ui/custom/autosize-textarea';
import { Field, FieldLabel, FieldError } from '@ncthub/ui/field';
import { Controller } from '@ncthub/ui/hooks/use-form';
import { UseFormReturn } from '@ncthub/ui/hooks/use-form';
import { Input } from '@ncthub/ui/input';
import { Separator } from '@ncthub/ui/separator';
import * as z from 'zod';

export default function UserReportForm({
  isNew,
  form,
  submitLabel,
  onSubmit,
}: {
  isNew: boolean;
  form: UseFormReturn<z.infer<typeof UserReportFormSchema>>;
  submitLabel: string;
  // eslint-disable-next-line no-unused-vars
  onSubmit?: (formData: z.infer<typeof UserReportFormSchema>) => void;
}) {
  return (
    <div className="grid h-fit gap-2 rounded-lg border p-4">
      <div className="text-lg font-semibold">Thông tin cơ bản</div>
      <Separator />
      <form
        onSubmit={onSubmit && form.handleSubmit(onSubmit)}
        className="grid gap-2"
      >
        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel>Title</FieldLabel>{' '}
              <Input placeholder="Title" {...field} disabled={isNew} />
              <FieldError
                errors={fieldState.error ? [fieldState.error] : undefined}
              />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="content"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel>Content</FieldLabel>{' '}
              <AutosizeTextarea
                placeholder="Content"
                {...field}
                disabled={isNew}
              />
              <FieldError
                errors={fieldState.error ? [fieldState.error] : undefined}
              />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="feedback"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel>Feedback</FieldLabel>{' '}
              <AutosizeTextarea
                placeholder="Feedback"
                {...field}
                disabled={isNew}
              />
              <FieldError
                errors={fieldState.error ? [fieldState.error] : undefined}
              />
            </Field>
          )}
        />

        <Separator />

        <Button type="submit" className="w-full" disabled={isNew}>
          {submitLabel}
        </Button>
      </form>
    </div>
  );
}
