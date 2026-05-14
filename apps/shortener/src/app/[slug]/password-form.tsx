import { Lock } from '@ncthub/ui/icons';
import PasswordFormFields from './password-form-fields';

interface PasswordFormProps {
  linkId: string;
  slug: string;
  hint: string | null;
}

export default function PasswordForm({
  linkId,
  slug,
  hint,
}: PasswordFormProps) {
  return (
    <div className="grid min-h-svh place-items-center bg-linear-to-br from-background to-muted/20 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-card p-6 shadow-lg sm:p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-dynamic-blue/10">
              <Lock className="h-6 w-6 text-dynamic-blue" />
            </div>
            <h1 className="mb-2 font-bold text-2xl text-foreground">
              Password Protected
            </h1>
            <p className="mb-6 text-muted-foreground">
              This link is password protected. Please enter the password to
              continue.
            </p>
          </div>

          <PasswordFormFields linkId={linkId} slug={slug} hint={hint} />
        </div>
      </div>
    </div>
  );
}
