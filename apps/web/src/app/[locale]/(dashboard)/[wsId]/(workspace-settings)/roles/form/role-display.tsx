import { SectionProps } from './index';
import { Field, FieldLabel, FieldError } from '@ncthub/ui/field';
import { Controller } from '@ncthub/ui/hooks/use-form';
import { Input } from '@ncthub/ui/input';
import { useTranslations } from 'next-intl';

export default function RoleFormDisplaySection({ form }: SectionProps) {
  const t = useTranslations();

  return (
    <>
      <div className="mb-2 rounded-md border border-dynamic-blue/20 bg-dynamic-blue/10 p-2 text-center font-bold text-dynamic-blue">
        {form.watch('name') || '-'}
      </div>
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{t('ws-roles.name')}</FieldLabel>{' '}
            <Input
              placeholder="Name"
              autoComplete="off"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </>
  );
}
