import { Button } from '@ncthub/ui/button';
import { Checkbox } from '@ncthub/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ncthub/ui/dialog';
import { Field, FieldLabel } from '@ncthub/ui/field';
import { Controller } from '@ncthub/ui/hooks/use-form';
import { useForm } from '@ncthub/ui/hooks/use-form';
import { Loader2, Sparkles } from '@ncthub/ui/icons';
import { Input } from '@ncthub/ui/input';
import { zodResolver } from '@ncthub/ui/resolvers';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { z } from 'zod';

const formSchema = z.object({
  context: z.string().min(1, {
    message: 'Context is required',
  }),
});

export function GenerateDialog({
  title,
  description,
  isLoading,
  onGenerate,
}: {
  title: string;
  description: string;
  isLoading?: boolean;
  // eslint-disable-next-line no-unused-vars
  onGenerate: (context: string) => void;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      context: '',
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    onGenerate(data.context);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="h-4 w-4" />
          {t('common.generate_with_ai')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={form.control}
            name="context"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>{t('common.context')}</FieldLabel>{' '}
                <Input placeholder={t('common.enter_context')} {...field} />
              </Field>
            )}
          />

          <div className="flex items-center space-x-2">
            <Checkbox id="include-content" disabled />
            <label
              htmlFor="include-content"
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('ws-ai-workflows.include_module_content')}
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="include-resources" disabled />
            <label
              htmlFor="include-resources"
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('ws-ai-workflows.include_resources')}
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="include-youtube-links" disabled />
            <label
              htmlFor="include-youtube-links"
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('ws-ai-workflows.include_youtube_links')}
            </label>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('common.generate')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
