'use client';

import { DEV_MODE } from '@/constants/common';
import { Button } from '@ncthub/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@ncthub/ui/form';
import { useForm } from '@ncthub/ui/hooks/use-form';
import { toast } from '@ncthub/ui/hooks/use-toast';
import { Mail } from '@ncthub/ui/icons';
import { Input } from '@ncthub/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@ncthub/ui/input-otp';
import { zodResolver } from '@ncthub/ui/resolvers';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as z from 'zod';

const FormSchema = z.object({
  email: z.string().email(),
  otp: z.string(),
});

export default function LoginForm() {
  const t = useTranslations('login');
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: DEV_MODE ? 'local@tuturuuu.com' : '',
      otp: '',
    },
  });

  useEffect(() => {
    if (DEV_MODE) form.setFocus('email');
  }, [DEV_MODE]);

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Resend cooldown
  const cooldown = 60;
  const [resendCooldown, setResendCooldown] = useState(0);

  const maxOTPLength = 6;

  // Update resend cooldown OTP is sent
  useEffect(() => {
    if (otpSent) {
      setResendCooldown(cooldown);

      // if on DEV_MODE, auto-open inbucket
      if (DEV_MODE) {
        window.open('http://localhost:8004', '_blank');
      }
    }
  }, [otpSent]);

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

    const res = await fetch('/api/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.ok) {
      // Notify user
      toast({
        title: t('success'),
        description: t('otp_sent'),
      });

      // OTP has been sent
      form.setValue('otp', '');
      form.clearErrors('otp');
      setOtpSent(true);

      // Reset cooldown
      setResendCooldown(cooldown);
    } else {
      toast({
        title: t('failed'),
        description: t('failed_to_send'),
      });
    }

    setLoading(false);
  };

  const verifyOtp = async (data: { email: string; otp: string }) => {
    setLoading(true);

    const res = await fetch('/api/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const nextUrl = searchParams.get('nextUrl');
      router.push(nextUrl ?? '/onboarding');
      router.refresh();
    } else {
      setLoading(false);

      form.setError('otp', { message: t('invalid_verification_code') });
      form.setValue('otp', '');

      toast({
        title: t('failed'),
        description: t('failed_to_verify'),
      });
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const { email, otp } = data;

    if (!otpSent) await sendOtp({ email });
    else if (otp) await verifyOtp({ email, otp });
    else {
      setLoading(false);
      toast({
        title: 'Error',
        description:
          'Please enter the OTP code sent to your email to continue.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('email_placeholder')}
                  {...field}
                  disabled={otpSent || loading}
                />
              </FormControl>

              {otpSent || (
                <FormDescription>{t('email_description')}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem className={otpSent ? '' : 'hidden'}>
              <FormLabel>{t('otp_code')}</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2 md:flex-row">
                  <InputOTP
                    maxLength={maxOTPLength}
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
                          className="max-md:w-full"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>

                  <Button
                    onClick={() => sendOtp({ email: form.getValues('email') })}
                    disabled={loading || resendCooldown > 0}
                    className="md:w-full"
                    variant="secondary"
                    type="button"
                  >
                    {resendCooldown > 0
                      ? `${t('resend')} (${resendCooldown})`
                      : t('resend')}
                  </Button>
                </div>
              </FormControl>
              {form.formState.errors.otp && (
                <FormMessage>{form.formState.errors.otp.message}</FormMessage>
              )}
              <FormDescription>{t('otp_description')}</FormDescription>
            </FormItem>
          )}
        />

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
              (otpSent && !form.formState.dirtyFields.otp)
            }
          >
            {loading ? t('processing') : t('continue')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
