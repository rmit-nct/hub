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
    <div className="relative grid min-h-svh overflow-hidden bg-[#121321] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(119,224,255,0.2),_transparent_28%),radial-gradient(circle_at_bottom,_rgba(82,122,255,0.12),_transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative mx-auto flex w-full max-w-md items-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(2,8,23,0.45)] backdrop-blur-xl sm:p-8">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-light-blue/20 bg-brand-light-blue/12 shadow-[0_12px_30px_rgba(119,224,255,0.15)]">
              <Lock className="h-6 w-6 text-brand-light-blue" />
            </div>
            <div className="mb-3 inline-flex rounded-full border border-brand-light-blue/15 bg-brand-light-blue/10 px-3 py-1 font-medium text-[11px] text-brand-light-blue/85 uppercase tracking-[0.28em]">
              Secure Access
            </div>
            <h1 className="mb-3 font-semibold text-3xl text-white">
              Password Protected
            </h1>
            <p className="mb-8 text-base text-white/68 leading-relaxed">
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
