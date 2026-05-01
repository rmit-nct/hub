'use client';

import { createClient } from '@ncthub/supabase/next/client';
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
import { Textarea } from '@ncthub/ui/textarea';
import { useRouter } from 'next/navigation';
import * as z from 'zod';

interface TaskFormProps {
  wsId: string;
  boardId: string;
  listId: string;
  onSuccess?: () => void;
}

const FormSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  // status: z.enum(taskStatuses).optional().default('Todo'),
  // priority: z.enum(taskPriorities).optional().default('Medium'),
  end_date: z.string().optional(), // Changed from due_date
});

export function TaskForm({ listId, onSuccess }: TaskFormProps) {
  const router = useRouter();
  const supabase = createClient(); // Initialize Supabase client

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      description: '',
      // status: 'Todo',
      // priority: 'Medium',
      end_date: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      const { error } = await supabase
        .from('tasks') // Use Supabase client to insert
        .insert({
          name: values.name,
          description: values.description,
          // priority: values.priority,
          end_date: values.end_date || null, // Handle optional date
          list_id: listId,
          // ws_id and board_id might be needed depending on your RLS and table structure
          // If tasks table doesn't directly link to ws_id, it might be inferred via list_id -> board_id -> ws_id
        });

      if (error) throw error;

      toast({
        title: 'Task created',
        description: 'The new task has been added successfully.',
      });
      onSuccess?.();
      router.refresh();
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: 'Failed to create task',
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
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Task Name</FieldLabel>{' '}
            <Input
              placeholder="Enter task name"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
              placeholder="(Optional) Enter task description"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="end_date" // Changed from due_date
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>End Date</FieldLabel>{' '}
            <Input
              type="date"
              aria-invalid={fieldState.invalid}
              {...field}
              value={field.value || ''}
            />
            <FieldDescription>(Optional) Select an end date.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full"
      >
        {form.formState.isSubmitting ? 'Creating...' : 'Create Task'}
      </Button>
    </form>
  );
}
