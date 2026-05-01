'use client';

import type { ProductPromotion } from '@ncthub/types/primitives/ProductPromotion';
import { Button } from '@ncthub/ui/button';
import { Field, FieldLabel, FieldError } from '@ncthub/ui/field';
import { Controller } from '@ncthub/ui/hooks/use-form';
import { useForm } from '@ncthub/ui/hooks/use-form';
import { toast } from '@ncthub/ui/hooks/use-toast';
import { Input } from '@ncthub/ui/input';
import { zodResolver } from '@ncthub/ui/resolvers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ncthub/ui/select';
import { Separator } from '@ncthub/ui/separator';
import { Textarea } from '@ncthub/ui/textarea';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { z } from 'zod';

interface Props {
  wsId: string;
  wsUserId?: string;
  data?: ProductPromotion;
  onFinish?: (data: z.infer<typeof FormSchema>) => void;
}

const FormSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    code: z.string().min(1).max(255),
    value: z.number().min(0),
    unit: z.string(),
  })
  .refine(
    ({ unit, value }) =>
      (unit === 'percentage' && value <= 100) || unit !== 'percentage',
    {
      // TODO: i18n
      message: 'Percentage value cannot exceed 100%',
      path: ['value'],
    }
  );

export function PromotionForm({ wsId, wsUserId, data, onFinish }: Props) {
  const t = useTranslations();

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name,
      description: data?.description,
      code: data?.code,
      value: data?.value ? parseInt(data?.value.toString()) : undefined,
      unit: data?.use_ratio ? 'percentage' : 'currency',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);

    const res = await fetch(
      data?.id
        ? `/api/v1/workspaces/${wsId}/promotions/${data.id}`
        : `/api/v1/workspaces/${wsId}/promotions`,
      {
        method: data?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          creator_id: wsUserId,
        }),
      }
    );

    if (res.ok) {
      onFinish?.(data);
      router.refresh();
    } else {
      setLoading(false);
      toast({
        title: 'Error creating promotion',
        description: 'An error occurred while creating the promotion',
      });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error}>
            <FieldLabel>{t('ws-inventory-promotions.form.name')}</FieldLabel>{' '}
            <Input
              {...field}
              placeholder={t('ws-inventory-promotions.form.name')}
            />
            <FieldError
              errors={fieldState.error ? [fieldState.error] : undefined}
            />
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error}>
            <FieldLabel>
              {t('ws-inventory-promotions.form.description')}
            </FieldLabel>{' '}
            <Textarea
              {...field}
              placeholder={t('ws-inventory-promotions.form.description')}
            />
            <FieldError
              errors={fieldState.error ? [fieldState.error] : undefined}
            />
          </Field>
        )}
      />
      <Separator className="my-4" />
      <Controller
        control={form.control}
        name="code"
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error} className="flex-1">
            <FieldLabel>{t('ws-inventory-promotions.form.code')}</FieldLabel>{' '}
            <Input
              {...field}
              placeholder={t('ws-inventory-promotions.form.code')}
            />
            <FieldError
              errors={fieldState.error ? [fieldState.error] : undefined}
            />
          </Field>
        )}
      />
      <div className="flex gap-6">
        <Controller
          control={form.control}
          name="value"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error} className="flex-1">
              <FieldLabel>{t('ws-inventory-promotions.form.value')}</FieldLabel>{' '}
              <Input
                type="number"
                {...field}
                placeholder={t('ws-inventory-promotions.form.value')}
              />
              <FieldError
                errors={fieldState.error ? [fieldState.error] : undefined}
              />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="unit"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel>
                {t('ws-inventory-promotions.form.unit.placeholder')}
              </FieldLabel>{' '}
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-32">
                  <SelectValue
                    {...field}
                    placeholder={t(
                      'ws-inventory-promotions.form.unit.placeholder'
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="currency">
                    <FieldLabel>
                      {t('ws-inventory-promotions.form.unit.currency')}
                    </FieldLabel>
                  </SelectItem>
                  <SelectItem value="percentage">
                    <FieldLabel>
                      {t('ws-inventory-promotions.form.unit.percentage')}
                    </FieldLabel>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldError
                errors={fieldState.error ? [fieldState.error] : undefined}
              />
            </Field>
          )}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading
          ? t('common.processing')
          : data?.id
            ? t('common.edit')
            : t('common.create')}
      </Button>
    </form>
  );
}
