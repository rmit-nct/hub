'use client';

import { TransactionCategory } from '@ncthub/types/primitives/TransactionCategory';
import { Button } from '@ncthub/ui/button';
import { SelectField } from '@ncthub/ui/custom/select-field';
import { Field, FieldLabel, FieldError } from '@ncthub/ui/field';
import { Controller } from '@ncthub/ui/hooks/use-form';
import { useForm } from '@ncthub/ui/hooks/use-form';
import { toast } from '@ncthub/ui/hooks/use-toast';
import { Input } from '@ncthub/ui/input';
import { zodResolver } from '@ncthub/ui/resolvers';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as z from 'zod';

interface Props {
  wsId: string;
  data?: TransactionCategory;
  // eslint-disable-next-line no-unused-vars
  onFinish?: (data: z.infer<typeof FormSchema>) => void;
}

const FormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(255),
  type: z.string(),
  // type: z.enum(['INCOME', 'EXPENSE']),
});

export function TransactionCategoryForm({ wsId, data, onFinish }: Props) {
  const t = useTranslations();

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name || '',
      type: data?.is_expense === false ? 'INCOME' : 'EXPENSE',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);

    const res = await fetch(
      data?.id
        ? `/api/workspaces/${wsId}/transactions/categories/${data.id}`
        : `/api/workspaces/${wsId}/transactions/categories`,
      {
        method: data?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          is_expense: data.type === 'EXPENSE',
        }),
      }
    );

    if (res.ok) {
      onFinish?.(data);
      router.refresh();
    } else {
      setLoading(false);
      toast({
        title: 'Error creating category',
        description: 'An error occurred while creating the category',
      });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
      <div className="grid gap-2 md:grid-cols-2">
        <Controller
          control={form.control}
          name="name"
          disabled={loading}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                {t('transaction-category-data-table.category_name')}
              </FieldLabel>{' '}
              <Input
                placeholder={t('transaction-category-data-table.name_examples')}
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="type"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="w-full">
              <FieldLabel>
                {t('transaction-category-data-table.category_type')}
              </FieldLabel>{' '}
              <SelectField
                id="category-type"
                placeholder={t('transaction-category-data-table.select_type')}
                options={[
                  {
                    value: 'EXPENSE',
                    label: t('transaction-category-data-table.expense'),
                  },
                  {
                    value: 'INCOME',
                    label: t('transaction-category-data-table.income'),
                  },
                ]}
                classNames={{ root: 'w-full' }}
                aria-invalid={fieldState.invalid}
                {...field}
                onValueChange={(value) => field.onChange(value)}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <div className="h-2" />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading
          ? t('common.processing')
          : data?.id
            ? t('ws-transaction-categories.edit')
            : t('ws-transaction-categories.create')}
      </Button>
    </form>
  );
}
