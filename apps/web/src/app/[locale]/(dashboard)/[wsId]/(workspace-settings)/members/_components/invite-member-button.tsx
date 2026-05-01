'use client';

import { User } from '@ncthub/types/primitives/User';
import { Button } from '@ncthub/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ncthub/ui/dialog';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@ncthub/ui/field';
import { Controller } from '@ncthub/ui/hooks/use-form';
import { useForm } from '@ncthub/ui/hooks/use-form';
import { toast } from '@ncthub/ui/hooks/use-toast';
import { UserPlus } from '@ncthub/ui/icons';
import { Input } from '@ncthub/ui/input';
import { zodResolver } from '@ncthub/ui/resolvers';
import { Separator } from '@ncthub/ui/separator';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as z from 'zod';

interface Props {
  wsId: string;
  currentUser?: User;
  label?: string;
  variant?: 'outline';
  disabled?: boolean;
}

const FormSchema = z.object({
  wsId: z.string().uuid(),
  email: z.string().email(),
  role: z.string(),
  accessLevel: z.string(),
  // accessLevel: z.enum(['MEMBER', 'ADMIN', 'OWNER']),
});

export default function InviteMemberButton({
  wsId,
  currentUser,
  label,
  variant,
  disabled,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    values: {
      wsId: wsId,
      email: '',
      role: '',
      accessLevel: 'MEMBER',
    },
  });

  const inviteMember = async (values: z.infer<typeof FormSchema>) => {
    const res = await fetch(`/api/workspaces/${wsId}/members/invite`, {
      method: 'POST',
      body: JSON.stringify(values),
    });

    if (res.ok) {
      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${values.email}.`,
      });
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      toast({ title: 'Failed to invite member', description: data.message });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (open) form.reset();
        setOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant={variant}
          className="w-full md:w-auto"
          disabled={!wsId || !currentUser || disabled}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Invite a member to your workspace.
          </DialogDescription>
        </DialogHeader>

        {currentUser?.role !== 'MEMBER' ? (
          <>
            <form
              onSubmit={form.handleSubmit(inviteMember)}
              className="space-y-3"
            >
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel>Email</FieldLabel>{' '}
                    <Input placeholder="username@example.com" {...field} />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
                  </Field>
                )}
              />

              <Separator />

              <Controller
                control={form.control}
                name="role"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel>Workspace Role</FieldLabel>{' '}
                    <Input
                      placeholder="Graphic Designer, Marketing Manager, etc."
                      {...field}
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
                    <FieldDescription>
                      The role of the member in the workspace is only for
                      display purposes and does not affect workspace
                      permissions.
                    </FieldDescription>
                  </Field>
                )}
                disabled={currentUser?.role === 'ADMIN'}
              />

              {/* <Separator />

                <Controller
                  control={form.control}
                  name="accessLevel"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error} className="w-full">
                      <FieldLabel>Access Level</FieldLabel>                        <SelectField
                          id="access-level"
                          placeholder="Select an access level"
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          options={
                            currentUser?.role === 'OWNER'
                              ? [
                                  { value: 'MEMBER', label: 'Member' },
                                  { value: 'ADMIN', label: 'Admin' },
                                  {
                                    value: 'OWNER',
                                    label: 'Owner',
                                  },
                                ]
                              : [
                                  { value: 'MEMBER', label: 'Member' },
                                  { value: 'ADMIN', label: 'Admin' },
                                ]
                          }
                          classNames={{ root: 'w-full' }}
                          disabled={currentUser?.role === 'MEMBER'}
                        />
                      <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                      <FieldDescription>
                        This will affect the member&apos;s permissions in the
                        workspace.
                      </FieldDescription>
                    </Field>
                  )}
                /> */}

              <Button type="submit" className="w-full">
                Invite Member
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8">
            <p className="text-center text-muted-foreground">
              You must be an admin or higher to invite members.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
