'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { INDIAN_STATES, EMPLOYEE_COUNT_OPTIONS, INDUSTRY_OPTIONS } from '@/lib/constants/india'
import { ArrowRight } from 'lucide-react'

export const companyDetailsSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  companyName: z.string().min(2, 'Company name is required'),
  state: z.string().min(1, 'Please select your state'),
  employeeCount: z.string().min(1, 'Please select employee count'),
  industry: z.string().min(1, 'Please select your industry'),
})

export type CompanyDetails = z.infer<typeof companyDetailsSchema>

interface CompanyDetailsFormProps {
  onSubmit: (details: CompanyDetails) => void
  defaultValues?: Partial<CompanyDetails>
  isLoading?: boolean
  onValuesChange?: (values: Partial<CompanyDetails>) => void
  submitLabel?: string
}

export function CompanyDetailsForm({
  onSubmit,
  defaultValues,
  isLoading,
  onValuesChange,
  submitLabel = 'Continue to Assessment',
}: CompanyDetailsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CompanyDetails>({
    resolver: zodResolver(companyDetailsSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!onValuesChange) return
    const { unsubscribe } = watch((values) =>
      onValuesChange(values as Partial<CompanyDetails>)
    )
    return unsubscribe
  }, [watch, onValuesChange])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input id="fullName" {...register('fullName')} placeholder="John Doe" />
          {errors.fullName && (
            <p className="text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register('email')} placeholder="john@company.com" />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 text-gray-600 bg-gray-50 border border-r-0 rounded-l-md text-sm">
              +91
            </span>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="9876543210"
              className="rounded-l-none"
              maxLength={10}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input id="companyName" {...register('companyName')} placeholder="Acme Pvt Ltd" />
          {errors.companyName && (
            <p className="text-sm text-red-600">{errors.companyName.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>State *</Label>
          <Select
            onValueChange={(v) => setValue('state', v, { shouldValidate: true })}
            defaultValue={defaultValues?.state}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && (
            <p className="text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Employee Count *</Label>
          <Select
            onValueChange={(v) => setValue('employeeCount', v, { shouldValidate: true })}
            defaultValue={defaultValues?.employeeCount}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYEE_COUNT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.employeeCount && (
            <p className="text-sm text-red-600">{errors.employeeCount.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Industry *</Label>
        <Select
          onValueChange={(v) => setValue('industry', v, { shouldValidate: true })}
          defaultValue={defaultValues?.industry}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.industry && (
          <p className="text-sm text-red-600">{errors.industry.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Please wait...' : (
          <>
            {submitLabel} <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </form>
  )
}
