'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { analytics } from '@/lib/analytics/tracking'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
  confirmPassword: z.string(),
  termsConsent: z.literal(true, { message: 'You must accept the Terms of Service' }),
  privacyConsent: z.literal(true, { message: 'You must accept the Privacy Policy' }),
  marketingConsent: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      termsConsent: false as unknown as true,
      privacyConsent: false as unknown as true,
      marketingConsent: false,
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Get IP address for DPDP compliance
      const ipResponse = await fetch('https://api.ipify.org?format=json')
      const { ip } = await ipResponse.json()

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (authData.user) {
        // Insert into public.users table
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          phone: data.phone,
          consent_timestamp: new Date().toISOString(),
          consent_version: '1.0',
          consent_ip: ip,
          marketing_consent: data.marketingConsent || false,
        })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }

        // Log consent for DPDP compliance
        await supabase.from('consent_logs').insert([
          {
            user_id: authData.user.id,
            consent_type: 'terms_of_service',
            consent_given: true,
            ip_address: ip,
            user_agent: navigator.userAgent,
            policy_version: '1.0',
          },
          {
            user_id: authData.user.id,
            consent_type: 'privacy_policy',
            consent_given: true,
            ip_address: ip,
            user_agent: navigator.userAgent,
            policy_version: '1.0',
          },
          {
            user_id: authData.user.id,
            consent_type: 'marketing',
            consent_given: data.marketingConsent || false,
            ip_address: ip,
            user_agent: navigator.userAgent,
            policy_version: '1.0',
          },
        ])

        analytics.userSignedUp({ method: 'email' })
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification link to your email address. Please click the link to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/login" className="text-blue-600 hover:underline">
            Go to Login
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start your compliance journey with ComplianceCheck</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" {...register('fullName')} placeholder="John Doe" />
            {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} placeholder="john@company.com" />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-gray-600 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                +91
              </span>
              <Input id="phone" {...register('phone')} placeholder="9876543210" className="rounded-l-none" />
            </div>
            {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="termsConsent"
                checked={watch('termsConsent')}
                onCheckedChange={(checked) => setValue('termsConsent', checked as true)}
              />
              <Label htmlFor="termsConsent" className="text-sm leading-tight">
                I agree to the <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
              </Label>
            </div>
            {errors.termsConsent && <p className="text-sm text-red-600">{errors.termsConsent.message}</p>}

            <div className="flex items-start space-x-2">
              <Checkbox
                id="privacyConsent"
                checked={watch('privacyConsent')}
                onCheckedChange={(checked) => setValue('privacyConsent', checked as true)}
              />
              <Label htmlFor="privacyConsent" className="text-sm leading-tight">
                I agree to the <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
              </Label>
            </div>
            {errors.privacyConsent && <p className="text-sm text-red-600">{errors.privacyConsent.message}</p>}

            <div className="flex items-start space-x-2">
              <Checkbox
                id="marketingConsent"
                checked={watch('marketingConsent')}
                onCheckedChange={(checked) => setValue('marketingConsent', checked as boolean)}
              />
              <Label htmlFor="marketingConsent" className="text-sm leading-tight text-gray-600">
                I want to receive product updates and offers (optional)
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
