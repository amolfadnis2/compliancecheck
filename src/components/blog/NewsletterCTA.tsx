'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackEvent } from '@/lib/analytics/tracking';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
type FormData = z.infer<typeof schema>;

interface NewsletterCTAProps {
  source: string;
  variant?: 'hero' | 'inline';
}

export function NewsletterCTA({ source, variant = 'inline' }: NewsletterCTAProps) {
  const [state, setState] = useState<'idle' | 'success' | 'error'>('idle');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, source }),
      });
      if (res.ok) {
        setState('success');
        trackEvent('blog_newsletter_signup', { source, status: 'pending' });
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-4">
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
        <p className="text-sm text-green-800 dark:text-green-300">
          Check your inbox — we&apos;ve sent you a confirmation link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={variant === 'hero' ? 'flex gap-2 max-w-md' : 'flex gap-2'}>
        <div className="flex-1">
          <label htmlFor={`newsletter-email-${source}`} className="sr-only">
            Email address
          </label>
          <Input
            id={`newsletter-email-${source}`}
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            {...register('email')}
            aria-describedby={errors.email ? `newsletter-error-${source}` : undefined}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p
              id={`newsletter-error-${source}`}
              role="alert"
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {errors.email.message}
            </p>
          )}
          {state === 'error' && (
            <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-shrink-0 bg-green-700 hover:bg-green-800 text-white gap-2"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </div>
    </form>
  );
}
