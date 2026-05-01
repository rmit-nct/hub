'use client';

import { Button } from '@ncthub/ui/button';
import { InputField } from '@ncthub/ui/custom/input-field';
import { Field, FieldDescription, FieldError } from '@ncthub/ui/field';
import { Controller } from '@ncthub/ui/hooks/use-form';
import { useForm } from '@ncthub/ui/hooks/use-form';
import { toast } from '@ncthub/ui/hooks/use-toast';
import { Check, Loader2 } from '@ncthub/ui/icons';
import { zodResolver } from '@ncthub/ui/resolvers';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as z from 'zod';

interface Props {
  oldEmail?: string;
  newEmail?: string | null;
  disabled?: boolean;
}

const FormSchema = z.object({
  email: z.string().email(),
});

export default function EmailInput({ oldEmail, newEmail, disabled }: Props) {
  const router = useRouter();
  const t = useTranslations('settings-account');

  const newEmailLabel = t('new-email');
  const currentEmailLabel = t('current-email');
  const changeEmailDescription = t('change-email-description');

  const [saving, setSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: oldEmail || '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setSaving(true);

    const res = await fetch('/api/auth/email', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: data.email }),
    });

    if (res.ok) {
      toast({
        title:
          data.email !== oldEmail
            ? 'Email update initiated'
            : 'Reverted change',
        description:
          data.email !== oldEmail
            ? 'Confirmation emails have been sent to both emails.'
            : 'Email change has been reverted.',
      });

      router.refresh();
    } else {
      toast({
        title: 'An error occurred',
        description: 'Please try again.',
      });
    }

    form.reset();
    setSaving(false);
  }

  const email = form.watch('email');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <div className="flex items-end gap-2">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="w-full">
              {' '}
              <InputField
                id="email"
                placeholder="example@rmit.edu.vn"
                label={
                  newEmail
                    ? oldEmail === email
                      ? currentEmailLabel
                      : newEmailLabel
                    : undefined
                }
                className="w-full"
                disabled={disabled}
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button
          type="submit"
          size="icon"
          onClick={form.handleSubmit(onSubmit)}
          disabled={!oldEmail || oldEmail === email || saving || disabled}
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Check className="h-5 w-5" />
          )}
        </Button>
      </div>

      {newEmail && (
        <div className="grid gap-2">
          <InputField
            id="new_email"
            label={newEmailLabel}
            value={newEmail}
            disabled
          />

          <FieldDescription className="md:max-w-124">
            {changeEmailDescription}
          </FieldDescription>
        </div>
      )}
    </form>
  );
}
