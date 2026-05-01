'use client';

import { DatePicker } from '@/components/row-actions/users/date-picker';
import { createClient } from '@ncthub/supabase/next/client';
import { WorkspaceUser } from '@ncthub/types/primitives/WorkspaceUser';
import { Avatar, AvatarFallback, AvatarImage } from '@ncthub/ui/avatar';
import { Button } from '@ncthub/ui/button';
import { SelectField } from '@ncthub/ui/custom/select-field';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@ncthub/ui/field';
import { Controller } from '@ncthub/ui/hooks/use-form';
import { useForm } from '@ncthub/ui/hooks/use-form';
import { toast } from '@ncthub/ui/hooks/use-toast';
import { Loader2, UserIcon } from '@ncthub/ui/icons';
import { Input } from '@ncthub/ui/input';
import { zodResolver } from '@ncthub/ui/resolvers';
import { ScrollArea } from '@ncthub/ui/scroll-area';
import { Separator } from '@ncthub/ui/separator';
import { getInitials } from '@ncthub/utils/name-helper';
import { generateRandomUUID } from '@ncthub/utils/uuid-helper';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as z from 'zod';

interface Props {
  wsId: string;
  data?: WorkspaceUser;
  // eslint-disable-next-line no-unused-vars
  onFinish?: (data: z.infer<typeof FormSchema>) => void;
}

const FormSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().optional(),
  display_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  // gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  birthday: z.date().optional(),
  ethnicity: z.string().optional(),
  guardian: z.string().optional(),
  national_id: z.string().optional(),
  address: z.string().optional(),
  note: z.string().optional(),
});

export default function UserForm({ wsId, data, onFinish }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(
    data?.avatar_url || null
  );
  const [file, setFile] = useState<File | null>(null); // Track the file selected

  const form = useForm({
    resolver: zodResolver(FormSchema),
    values: {
      id: data?.id,
      full_name: data?.full_name || '',
      display_name: data?.display_name || '',
      email: data?.email || undefined,
      phone: data?.phone || '',
      gender: data?.gender?.toLocaleUpperCase() as
        | 'MALE'
        | 'FEMALE'
        | 'OTHER'
        | undefined,
      birthday: data?.birthday ? new Date(data.birthday) : undefined,
      ethnicity: data?.ethnicity || '',
      guardian: data?.guardian || '',
      national_id: data?.national_id || '',
      address: data?.address || '',
      note: data?.note || '',
    },
  });

  const handleFileSelect = (file: File) => {
    const fileURL = URL.createObjectURL(file);
    setPreviewSrc(fileURL);
    setFile(file);
  };

  const removeAvatar = async () => {
    setSaving(true);
    setPreviewSrc(null);
    setFile(null);

    if (!data?.avatar_url) {
      setSaving(false);
      return;
    }

    router.refresh();
    setSaving(false);
  };

  async function uploadImageToSupabase(file: File, wsId: string) {
    const supabase = createClient();
    const filePath = `${wsId}/users/${generateRandomUUID()}`;

    const { error } = await supabase.storage
      .from('workspaces')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error.message);
      throw new Error('Failed to upload image');
    }

    const { data, error: signedURLError } = await supabase.storage
      .from('workspaces')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    if (signedURLError) {
      console.error('Error generating signed URL:', signedURLError.message);
      throw new Error('Failed to generate signed URL');
    }

    return data.signedUrl;
  }

  const onSubmit = async (formData: z.infer<typeof FormSchema>) => {
    setSaving(true);
    try {
      let avatarUrl = previewSrc;

      if (file) {
        avatarUrl = await uploadImageToSupabase(file, wsId);
      }

      const res = await fetch(
        formData.id
          ? `/api/v1/workspaces/${wsId}/users/${formData.id}`
          : `/api/v1/workspaces/${wsId}/users`,
        {
          method: formData.id ? 'PUT' : 'POST',
          body: JSON.stringify({
            ...formData,
            avatar_url: avatarUrl,
            birthday: dayjs(formData.birthday).format('YYYY/MM/DD'),
          }),
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

  const name = form.watch('display_name') || form.watch('full_name');

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
        <ScrollArea className="grid h-[50vh] gap-3 border-b">
          {data?.id && (
            <>
              <Controller
                control={form.control}
                name="id"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel>User ID</FieldLabel>{' '}
                    <Input {...field} disabled />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
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

          <div className="flex items-center gap-2 rounded-md border p-4">
            <Avatar>
              <AvatarImage src={previewSrc || data?.avatar_url || ''} />
              <AvatarFallback className="font-semibold">
                {name ? getInitials(name) : <UserIcon className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>

            <div>
              <Button variant="ghost" type="button" className="mt-2">
                <label htmlFor="file-upload" className="cursor-pointer">
                  {previewSrc
                    ? t('settings-account.new_avatar')
                    : t('settings-account.upload_avatar')}
                </label>
              </Button>
              <input
                id="file-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              {previewSrc && (
                <Button variant="destructive" onClick={removeAvatar}>
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    t('settings-account.remove_avatar')
                  )}
                </Button>
              )}
            </div>
          </div>

          <Controller
            control={form.control}
            name="full_name"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Full Name</FieldLabel>{' '}
                <Input placeholder="John Doe" {...field} />
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
                <FieldDescription>The real name of this user.</FieldDescription>
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="display_name"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Display Name</FieldLabel>{' '}
                <Input placeholder="John Doe" {...field} />
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
                <FieldDescription>
                  This name will be displayed everywhere in the current
                  workspace for this user.
                </FieldDescription>
              </Field>
            )}
          />

          <Separator />

          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Email</FieldLabel>{' '}
                <Input placeholder="example@tuturuuu.com" {...field} />
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Phone Number</FieldLabel>{' '}
                <Input placeholder="+123456789" {...field} />
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          <Separator />

          <Controller
            control={form.control}
            name="gender"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error} className="w-full">
                <FieldLabel>Gender</FieldLabel>{' '}
                <SelectField
                  id="gender"
                  placeholder="Please select a gender"
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  options={[
                    { value: 'MALE', label: 'Male' },
                    { value: 'FEMALE', label: 'Female' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                />
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="birthday"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error} className="grid w-full">
                <FieldLabel>Birthday</FieldLabel>{' '}
                <DatePicker
                  defaultValue={
                    field.value ? dayjs(field.value).toDate() : undefined
                  }
                  onValueChange={field.onChange}
                  className="w-full"
                />
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          <Separator />

          <Controller
            control={form.control}
            name="national_id"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>National ID</FieldLabel>{' '}
                <Input placeholder="Empty" {...field} />
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="ethnicity"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Ethnicity</FieldLabel>{' '}
                <Input placeholder="Empty" {...field} />
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="guardian"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Guardian</FieldLabel>{' '}
                <Input placeholder="Empty" {...field} />
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="address"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Address</FieldLabel>{' '}
                <Input placeholder="Empty" {...field} />
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          <Separator />

          <Controller
            control={form.control}
            name="note"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>Notes</FieldLabel>{' '}
                <Input placeholder="Empty" {...field} />
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />
        </ScrollArea>

        <div className="flex justify-center gap-2">
          <Button type="submit" className="w-full">
            Save changes
          </Button>
        </div>
      </form>
    </>
  );
}
