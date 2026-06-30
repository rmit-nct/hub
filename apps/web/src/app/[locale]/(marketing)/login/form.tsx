'use client';

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { resolveTurnstileClientState } from '@ncthub/turnstile/client';
import { Button } from '@ncthub/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@ncthub/ui/field';
import { Controller, useForm } from '@ncthub/ui/hooks/use-form';
import { Mail } from '@ncthub/ui/icons';
import { Input } from '@ncthub/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@ncthub/ui/input-otp';
import { zodResolver } from '@ncthub/ui/resolvers';
import { toast } from '@ncthub/ui/sonner';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as z from 'zod';
import { DEV_MODE } from '@/constants/common';
import { sendOtpAction, verifyOtpAction } from './actions';

const FormSchema = z.object({
  email: z.string().email(),
  otp: z.string(),
});

export default function LoginForm() {
  const t = useTranslations('login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: DEV_MODE ? 'local@tuturuuu.com' : '',
      otp: '',
    },
  });

  useEffect(() => {
    if (DEV_MODE) form.setFocus('email');
  }, [form]);

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>();
  const [captchaError, setCaptchaError] = useState<string>();
  const captchaRef = useRef<TurnstileInstance>(null);
  const inbucketWindowOpenedRef = useRef(false);
  const turnstileClientState = resolveTurnstileClientState({
    devMode: DEV_MODE,
  });
  const turnstileSiteKey = turnstileClientState.siteKey;

  const resetCaptcha = useCallback(() => {
    captchaRef.current?.reset();
    setCaptchaToken(undefined);
  }, []);

  const handleCaptchaError = useCallback(() => {
    setCaptchaError(t('captcha_error'));
  }, [t]);

  const handleCaptchaTimeout = useCallback(() => {
    resetCaptcha();
  }, [resetCaptcha]);

  // Resend cooldown
  const cooldown = 60;
  const [resendCooldown, setResendCooldown] = useState(0);

  const maxOTPLength = 6;

  // Reduce cooldown by 1 every second
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const sendOtp = async (data: { email: string }) => {
    setLoading(true);

    const result = await sendOtpAction({
      email: data.email,
      locale,
      captchaToken,
    });

    resetCaptcha();
    setCaptchaError(undefined);

    if (result.success) {
      // Notify user
      toast(t('success'), { description: t('otp_sent') });

      // OTP has been sent
      form.setValue('otp', '');
      form.clearErrors('otp');
      setOtpSent(true);

      // Reset cooldown
      setResendCooldown(cooldown);

      // if on DEV_MODE, auto-open inbucket once after the OTP is sent
      if (DEV_MODE && !inbucketWindowOpenedRef.current) {
        inbucketWindowOpenedRef.current = true;
        window.open('http://localhost:8004', '_blank');
      }
    } else {
      toast(t('failed'), { description: result.error || t('failed_to_send') });
    }

    setLoading(false);
  };

  const verifyOtp = async (data: { email: string; otp: string }) => {
    setLoading(true);

    const result = await verifyOtpAction({
      email: data.email,
      otp: data.otp,
      locale,
    });

    if (result.success) {
      const nextUrl = searchParams.get('nextUrl');
      router.push(nextUrl ?? '/');
      router.refresh();
    } else {
      setLoading(false);

      form.setError('otp', { message: t('invalid_verification_code') });
      form.setValue('otp', '');

      toast(t('failed'), {
        description: result.error || t('failed_to_verify'),
      });
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const { email, otp } = data;

    if (!otpSent) await sendOtp({ email });
    else if (otp) await verifyOtp({ email, otp });
    else {
      setLoading(false);
      toast('Error', {
        description:
          'Please enter the OTP code sent to your email to continue.',
      });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Email</FieldLabel>{' '}
            <Input
              placeholder={t('email_placeholder')}
              aria-invalid={fieldState.invalid}
              {...field}
              disabled={otpSent || loading}
            />
            {otpSent || (
              <FieldDescription>{t('email_description')}</FieldDescription>
            )}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="otp"
        render={({ field, fieldState }) => (
          <Field
            data-invalid={fieldState.invalid}
            className={otpSent ? '' : 'hidden'}
          >
            <FieldLabel>{t('otp_code')}</FieldLabel>{' '}
            <div className="grid gap-2 sm:grid-cols-[minmax(13.5rem,1fr)_minmax(10rem,1fr)]">
              <InputOTP
                maxLength={maxOTPLength}
                aria-invalid={fieldState.invalid}
                containerClassName="w-full"
                {...field}
                onChange={(value) => {
                  form.setValue('otp', value);
                  if (value.length === maxOTPLength)
                    form.handleSubmit(onSubmit)();
                }}
                disabled={loading}
              >
                <InputOTPGroup className="w-full justify-center">
                  {Array.from({ length: maxOTPLength }).map((_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="min-w-0 flex-1"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <Button
                onClick={() => sendOtp({ email: form.getValues('email') })}
                disabled={
                  loading ||
                  resendCooldown > 0 ||
                  (turnstileClientState.isRequired && !captchaToken)
                }
                className="w-full"
                variant="secondary"
                type="button"
              >
                {resendCooldown > 0
                  ? `${t('resend')} (${resendCooldown})`
                  : t('resend')}
              </Button>
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            <FieldDescription>{t('otp_description')}</FieldDescription>
          </Field>
        )}
      />

      {turnstileClientState.isRequired && (
        <div className="flex flex-col items-center gap-2">
          {turnstileClientState.canRenderWidget && turnstileSiteKey ? (
            <Turnstile
              ref={captchaRef}
              siteKey={turnstileSiteKey}
              onSuccess={(token) => {
                setCaptchaToken(token);
                setCaptchaError(undefined);
              }}
              onExpire={() => setCaptchaToken(undefined)}
              onError={handleCaptchaError}
              onTimeout={handleCaptchaTimeout}
            />
          ) : (
            <p className="text-destructive text-sm">
              {t('captcha_not_configured')}
            </p>
          )}
          {captchaError && (
            <p className="text-destructive text-sm">{captchaError}</p>
          )}
        </div>
      )}

      {otpSent && (
        <div className="grid gap-2 md:grid-cols-2">
          {DEV_MODE ? (
            <Link
              href="http://localhost:8004"
              target="_blank"
              className="col-span-full"
              aria-disabled={loading}
            >
              <Button
                type="button"
                className="w-full"
                variant="outline"
                disabled={loading}
              >
                <Mail size={18} className="mr-1" />
                {t('open_inbucket')}
              </Button>
            </Link>
          ) : (
            <>
              <Link
                href="https://mail.google.com/mail/u/0/#inbox"
                target="_blank"
                aria-disabled={loading}
              >
                <Button
                  type="button"
                  className="w-full"
                  variant="outline"
                  disabled={loading}
                >
                  <Mail size={18} className="mr-1" />
                  {t('open_gmail')}
                </Button>
              </Link>

              <Link
                href="https://outlook.live.com/mail/inbox"
                target="_blank"
                aria-disabled={loading}
              >
                <Button
                  type="button"
                  className="w-full"
                  variant="outline"
                  disabled={loading}
                >
                  <Mail size={18} className="mr-1" />
                  {t('open_outlook')}
                </Button>
              </Link>
            </>
          )}
        </div>
      )}

      <div className="grid gap-2">
        <Button
          type="submit"
          className="w-full"
          disabled={
            loading ||
            form.formState.isSubmitting ||
            !form.formState.isValid ||
            (otpSent && !form.formState.dirtyFields.otp) ||
            (!otpSent && turnstileClientState.isRequired && !captchaToken)
          }
        >
          {loading ? t('processing') : t('continue')}
        </Button>
      </div>
    </form>
  );
}
