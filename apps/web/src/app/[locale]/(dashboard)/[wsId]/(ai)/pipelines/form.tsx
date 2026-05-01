'use client';

import type { CrawledUrl } from '@ncthub/types/db';
import { Button } from '@ncthub/ui/button';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@ncthub/ui/field';
import { Controller } from '@ncthub/ui/hooks/use-form';
import { useForm } from '@ncthub/ui/hooks/use-form';
import { toast } from '@ncthub/ui/hooks/use-toast';
import { Input } from '@ncthub/ui/input';
import { zodResolver } from '@ncthub/ui/resolvers';
import { ScrollArea } from '@ncthub/ui/scroll-area';
import { Separator } from '@ncthub/ui/separator';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as z from 'zod';

const FormSchema = z.object({
  id: z.string().optional(),
  url: z.string().optional(),
});

interface Props {
  wsId: string;
  data?: CrawledUrl;
  // eslint-disable-next-line no-unused-vars
  onFinish?: (data: z.infer<typeof FormSchema>) => void;
}

export default function DatasetForm({ wsId, data, onFinish }: Props) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    values: {
      id: data?.id,
      url: data?.url || '',
    },
  });

  const onSubmit = async (formData: z.infer<typeof FormSchema>) => {
    setSaving(true);
    try {
      const res = await fetch(
        formData.id
          ? `/api/v1/workspaces/${wsId}/crawlers/${formData.id}`
          : `/api/v1/workspaces/${wsId}/crawlers`,
        {
          method: formData.id ? 'PUT' : 'POST',
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        onFinish?.(formData);
        router.refresh();
      } else {
        const resData = await res.json();
        toast({
          title: `Failed to ${formData.id ? 'edit' : 'create'} user`,
          description: resData.message,
        });
      }
    } catch (error) {
      toast({
        title: `Failed to ${formData.id ? 'edit' : 'create'} user`,
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
        <ScrollArea className="max-h-96">
          <div className="grid gap-2">
            {data?.id && (
              <>
                <Controller
                  control={form.control}
                  name="id"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Dataset ID</FieldLabel>{' '}
                      <Input
                        aria-invalid={fieldState.invalid}
                        {...field}
                        disabled
                      />
                      <FieldError
                        errors={
                          fieldState.error ? [fieldState.error] : undefined
                        }
                      />
                      <FieldDescription>
                        The identification number of this user in your
                        workspace. This is automatically managed by Tuturuuu,
                        and cannot be changed.
                      </FieldDescription>
                    </Field>
                  )}
                />
                <Separator />
              </>
            )}

            <Controller
              control={form.control}
              name="url"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>URL</FieldLabel>{' '}
                  <Input
                    placeholder="https://example.com"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </ScrollArea>

        <div className="flex justify-center gap-2">
          <Button type="submit" className="w-full" disabled={saving}>
            Save changes
          </Button>
        </div>
      </form>
    </>
  );
}
