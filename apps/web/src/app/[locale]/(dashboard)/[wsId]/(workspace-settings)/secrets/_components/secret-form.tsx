import { WorkspaceSecret } from '@/types/primitives/WorkspaceSecret';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/ui/form';
import { Input } from '@repo/ui/components/ui/input';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface Props {
  data: WorkspaceSecret;
  submitLabel?: string;
  onSubmit: (values: z.infer<typeof FormSchema>) => void;
}

const FormSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

export const ApiConfigFormSchema = FormSchema;

export default function SecretForm({ data, submitLabel, onSubmit }: Props) {
  const t = useTranslations('ws-secrets');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    values: {
      name: data.name || '',
      value: data.value || (data.id ? '' : 'true'),
    },
  });

  const isDirty = form.formState.isDirty;
  const isValid = form.formState.isValid;
  const isSubmitting = form.formState.isSubmitting;

  const disabled = !isDirty || !isValid || isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('name')}</FormLabel>
              <FormControl>
                <Input
                  placeholder="Name"
                  autoComplete="off"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .replace(/-/g, '_')
                        .replace(/\s/g, '_')
                        .toUpperCase()
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('value')}</FormLabel>
              <FormControl>
                <Input placeholder="Value" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={disabled}>
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
