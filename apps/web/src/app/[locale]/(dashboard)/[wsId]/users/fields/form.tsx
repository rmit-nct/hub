import { DatePicker } from '@/components/row-actions/users/date-picker';
import { fetcher } from '@/utils/fetcher';
import { WorkspaceUserField } from '@ncthub/types/primitives/WorkspaceUserField';
import { Button } from '@ncthub/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@ncthub/ui/command';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@ncthub/ui/field';
import { Controller } from '@ncthub/ui/hooks/use-form';
import { useForm } from '@ncthub/ui/hooks/use-form';
import { CheckIcon, ChevronsUpDown, PlusIcon, XIcon } from '@ncthub/ui/icons';
import { Input } from '@ncthub/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@ncthub/ui/popover';
import { zodResolver } from '@ncthub/ui/resolvers';
import { ScrollArea } from '@ncthub/ui/scroll-area';
import { Separator } from '@ncthub/ui/separator';
import { Textarea } from '@ncthub/ui/textarea';
import { cn } from '@ncthub/utils/format';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import useSWR from 'swr';
import * as z from 'zod';

interface Props {
  data: WorkspaceUserField;
  submitLabel?: string;
  onSubmit: (values: z.infer<typeof FormSchema>) => void;
}

const FormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string().min(1),
  possible_values: z.array(z.string()).optional(),
  default_value: z.string().optional(),
  notes: z.string().optional(),
});

export const ApiConfigFormSchema = FormSchema;

export default function UserFieldForm({ data, submitLabel, onSubmit }: Props) {
  const t = useTranslations();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    values: {
      name: data.name || '',
      description: data.description || '',
      type: data.type || '',
      possible_values: data.possible_values || [],
      default_value: data.default_value || '',
      notes: data.notes || '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const disabled = isSubmitting;

  const [showTypes, setShowTypes] = useState(false);

  const { data: types, error: typesError } = useSWR<{ id: string }[]>(
    `/api/v1/infrastructure/users/fields/types`,
    fetcher
  );

  const typesLoading = !types && !typesError;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 pt-0">
      <ScrollArea className="mb-4 h-96 w-full">
        <div className="grid gap-2">
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('ws-user-fields.name')}</FieldLabel>{' '}
                <Input
                  placeholder={t('ws-user-fields.name')}
                  autoComplete="off"
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
            name="type"
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="flex flex-col"
              >
                <FieldLabel>{t('ws-user-fields.type')}</FieldLabel>
                <Popover open={showTypes} onOpenChange={setShowTypes}>
                  <PopoverTrigger asChild>
                    {' '}
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                      disabled={!!data.id || typesLoading}
                    >
                      {field.value
                        ? t(
                            `user-field-data-table.${
                              (types
                                ?.find((t) => t.id === field.value)
                                ?.id.toLowerCase() || '') as
                                | 'boolean'
                                | 'text'
                                | 'number'
                                | 'date'
                                | 'datetime'
                            }`
                          )
                        : typesLoading
                          ? t('common.loading')
                          : t('ws-user-fields.select_type')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command
                      filter={(value, search) => {
                        if (value.includes(search)) return 1;
                        return 0;
                      }}
                    >
                      <CommandInput
                        placeholder="Search type..."
                        disabled={typesLoading}
                      />
                      <CommandEmpty>No type found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {(types?.length || 0) > 0
                            ? types?.map((type) => (
                                <CommandItem
                                  key={type.id}
                                  value={type.id}
                                  onSelect={() => {
                                    form.setValue('type', type.id || '');
                                    setShowTypes(false);

                                    if (type.id === 'BOOLEAN') {
                                      form.setValue('possible_values', [
                                        'true',
                                        'false',
                                      ]);
                                    } else {
                                      form.setValue('possible_values', ['']);
                                    }
                                  }}
                                  disabled={['DATETIME'].includes(type.id)}
                                >
                                  <CheckIcon
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      type.id === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {t(
                                    `user-field-data-table.${
                                      type.id.toLowerCase() as
                                        | 'boolean'
                                        | 'text'
                                        | 'number'
                                        | 'date'
                                        | 'datetime'
                                    }`
                                  )}
                                </CommandItem>
                              ))
                            : null}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Separator />

          <Controller
            control={form.control}
            name="possible_values"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('ws-user-fields.possible_values')}</FieldLabel>
                <FieldDescription>
                  {t('ws-user-fields.possible_values_description')}
                </FieldDescription>
                <div
                  className={
                    form.getValues('type') === 'BOOLEAN'
                      ? 'flex gap-2'
                      : 'grid gap-2'
                  }
                >
                  {field.value?.map((value: string, index: number) => (
                    <div key={index} className="flex w-full gap-1">
                      {' '}
                      {form.getValues('type') === 'DATE' ? (
                        <DatePicker
                          defaultValue={value ? new Date(value) : undefined}
                          onValueChange={(value) => {
                            const values = field.value || [];
                            values[index] = value
                              ? dayjs(value).format('ws-user-fields.YYYY-MM-DD')
                              : '';
                            form.setValue('possible_values', values);
                          }}
                          className="w-full"
                        />
                      ) : (
                        <Input
                          type={
                            form.getValues('type') === 'NUMBER'
                              ? 'number'
                              : 'text'
                          }
                          placeholder={t('ws-user-fields.value')}
                          autoComplete="off"
                          className="w-full"
                          value={value}
                          onChange={(e) => {
                            const values = field.value || [];
                            values[index] = e.target.value;
                            form.setValue('possible_values', values);
                          }}
                          disabled={form.getValues('type') === 'BOOLEAN'}
                        />
                      )}
                      {form.getValues('type') !== 'BOOLEAN' && (
                        <Button
                          size="icon"
                          type="button"
                          variant="destructive"
                          onClick={() => {
                            const values = field.value || [];
                            values.splice(index, 1);
                            form.setValue('possible_values', values);
                          }}
                        >
                          <XIcon />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {form.getValues('type') !== 'BOOLEAN' && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                form.setValue('possible_values', [
                  ...(form.getValues('possible_values') || []),
                  '',
                ]);
              }}
              disabled={!form.getValues('type')}
            >
              {t('ws-user-fields.add_possible_value')}
              <PlusIcon className="ml-2" />
            </Button>
          )}

          <Controller
            control={form.control}
            name="default_value"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('ws-user-fields.default_value')}</FieldLabel>{' '}
                <Input
                  placeholder={t('user-field-data-table.null')}
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Separator />

          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('ws-user-fields.description')}</FieldLabel>{' '}
                <Textarea
                  placeholder={t('ws-user-fields.description')}
                  autoComplete="off"
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
            name="notes"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('ws-user-fields.notes')}</FieldLabel>{' '}
                <Textarea
                  placeholder={t('ws-user-fields.notes')}
                  autoComplete="off"
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

      <Button type="submit" className="w-full" disabled={disabled}>
        {submitLabel}
      </Button>
    </form>
  );
}
