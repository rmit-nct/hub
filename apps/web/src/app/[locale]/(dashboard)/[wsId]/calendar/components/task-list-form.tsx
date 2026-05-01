'use client';

import { createClient } from '@ncthub/supabase/next/client';
import { Button } from '@ncthub/ui/button';
import { Field, FieldLabel, FieldError } from '@ncthub/ui/field';
import { Controller } from '@ncthub/ui/hooks/use-form';
import { useForm } from '@ncthub/ui/hooks/use-form';
import { toast } from '@ncthub/ui/hooks/use-toast';
import { Input } from '@ncthub/ui/input';
import { zodResolver } from '@ncthub/ui/resolvers';
import { useRouter } from 'next/navigation';
import * as z from 'zod';

interface TaskListFormProps {
  wsId: string;
  boardId: string;
  onSuccess?: () => void;
}

const FormSchema = z.object({
  name: z.string().min(1, 'List name is required'),
});

export function TaskListForm({ boardId, onSuccess }: TaskListFormProps) {
  const router = useRouter();
  const supabase = createClient(); // Initialize Supabase client

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      const { error } = await supabase
        .from('task_lists') // Use Supabase client to insert
        .insert({
          name: values.name,
          board_id: boardId,
          // ws_id might be needed if your task_lists table has a direct ws_id column
          // and RLS requires it, or if it's not automatically inferred via board_id
        })
        .select();

      if (error) throw error;

      toast({
        title: 'Task list created',
        description: 'The new task list has been added successfully.',
      });
      onSuccess?.();
      router.refresh();
    } catch (error: any) {
      console.error('Error creating task list:', error);
      toast({
        title: 'Failed to create task list',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error}>
            <FieldLabel>List Name</FieldLabel>{' '}
            <Input placeholder="Enter list name" {...field} />
            <FieldError
              errors={fieldState.error ? [fieldState.error] : undefined}
            />
          </Field>
        )}
      />
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Creating...' : 'Create List'}
      </Button>
    </form>
  );
}
