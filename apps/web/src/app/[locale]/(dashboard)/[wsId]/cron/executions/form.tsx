'use client';

import type { WorkspaceAIModel } from '@ncthub/types/db';
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
import { Textarea } from '@ncthub/ui/textarea';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as z from 'zod';

interface Props {
  wsId: string;
  data?: WorkspaceAIModel;
  // eslint-disable-next-line no-unused-vars
  onFinish?: (data: z.infer<typeof FormSchema>) => void;
}

const FormSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export default function ModelForm({ wsId, data, onFinish }: Props) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    values: {
      id: data?.id || '',
      name: data?.name || '',
      description: data?.description || '',
      created_at: data?.created_at || '',
      updated_at: data?.updated_at || '',
    },
  });

  const onSubmit = async (formData: z.infer<typeof FormSchema>) => {
    setSaving(true);
    try {
      const res = await fetch(
        formData.id
          ? `/api/v1/workspaces/${wsId}/users/${formData.id}`
          : `/api/v1/workspaces/${wsId}/users`,
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
        <ScrollArea className="grid gap-3 border-b">
          {data?.id && (
            <>
              <Controller
                control={form.control}
                name="id"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Model ID</FieldLabel>{' '}
                    <Input
                      aria-invalid={fieldState.invalid}
                      {...field}
                      disabled
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                    <FieldDescription>
                      The identification number of this user in your workspace.
                      This is automatically managed by Tuturuuu, and cannot be
                      changed.
                    </FieldDescription>
                  </Field>
                )}
              />
              <Separator />
            </>
          )}

          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Name</FieldLabel>{' '}
                <Input
                  placeholder="John Doe"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Description</FieldLabel>{' '}
                <Textarea
                  placeholder="Empty"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
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
