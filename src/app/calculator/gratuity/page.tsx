'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Calculator, Save, Loader2, CheckCircle, AlertTriangle, Info, Calendar } from 'lucide-react'
import { AssessmentHeader } from '@/components/assessment/assessment-header'
import { RUPEE } from '@/lib/constants'
import {
  EMPLOYMENT_TYPES,
  GRATUITY_CONSTANTS,
  GRATUITY_COMPLIANCE_INFO,
  calculateGratuity,
  formatCurrency,
  type GratuityInput,
  type GratuityResult,
} from '@/lib/calculators/gratuity-calculator'

// Form validation schema - simplified
const userDetailsSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
})

type UserDetails = z.infer<typeof userDetailsSchema>

// Local storage key
const STORAGE_KEY = 'gratuity_calculator_progress'

interface SavedProgress {
  step: number
  userDetails: UserDetails | null
  savedAt: string
}

export default function GratuityCalculatorPage() {
  const [step, setStep] = useState(1)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false)

  // Calculator input states
  const [employmentType, setEmploymentType] = useState<'regular' | 'fixed_term' | 'journalist' | null>(null)
  const [basicDA, setBasicDA] = useState<string>('')
  const [dateOfJoining, setDateOfJoining] = useState<string>('')
  const [lastWorkingDate, setLastWorkingDate] = useState<string>('')
  
  // Result state
  const [result, setResult] = useState<GratuityResult | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserDetails>({
    resolver: zodResolver(userDetailsSchema),
  })

  // Load saved progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const progress: SavedProgress = JSON.parse(saved)
        const savedTime = new Date(progress.savedAt).getTime()
        const now = Date.now()
        if (now - savedTime < 24 * 60 * 60 * 1000) {
          setStep(progress.step)
          if (progress.userDetails) {
            setUserDetails(progress.userDetails)
            reset(progress.userDetails)
          }
          setHasRestoredProgress(true)
        }
      }
    } catch (e) {
      console.error('Error loading saved progress:', e)
    }
  }, [reset])

  // Auto-save progress
  const saveProgress = useCallback(() => {
    setSaveStatus('saving')
    try {
      const progress: SavedProgress = {
        step,
        userDetails,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (e) {
      console.error('Error saving progress:', e)
      setSaveStatus('idle')
    }
  }, [step, userDetails])

  // Clear saved progress
  const clearProgress = () => {
    localStorage.removeItem(STORAGE_KEY)
  }

  // Calculate progress percentage
  const getProgress = () => {
    if (step === 1) return 10
    if (step === 2) return 50
    return 100
  }

  // Handle user details submission
  const onUserDetailsSubmit = (data: UserDetails) => {
    setUserDetails(data)
    setStep(2)
    saveProgress()
  }

  // Auto-save to database
  const saveToDatabase = async (calcResult: GratuityResult, inputs: {
    employmentType: string
    basicDA: number
    dateOfJoining: string
    lastWorkingDate: string
  }) => {
    if (!userDetails) return
    
    try {
      await fetch('/api/calculator/gratuity-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDetails,
          inputs,
          result: calcResult,
        }),
      })
      // Clear saved progress on successful submission
      clearProgress()
    } catch (error) {
      console.error('Auto-save error:', error)
      // Silent fail - calculation still shown to user
    }
  }

  // Handle calculation
  const handleCalculate = async () => {
    if (!employmentType || !basicDA || !dateOfJoining || !lastWorkingDate) {
      return
    }

    setIsSubmitting(true)

    const input: GratuityInput = {
      employmentType,
      lastDrawnBasicDA: parseFloat(basicDA) || 0,
      dateOfJoining: new Date(dateOfJoining),
      lastWorkingDate: new Date(lastWorkingDate),
    }

    const calculationResult = calculateGratuity(input)
    setResult(calculationResult)
    setStep(3)

    // Auto-save to database
    await saveToDatabase(calculationResult, {
      employmentType,
      basicDA: parseFloat(basicDA),
      dateOfJoining,
      lastWorkingDate,
    })

    setIsSubmitting(false)
  }

  // Check if calculator inputs are valid
  const isCalculatorValid = () => {
    if (!employmentType || !basicDA || !dateOfJoining || !lastWorkingDate) {
      return false
    }
    const joining = new Date(dateOfJoining)
    const leaving = new Date(lastWorkingDate)
    return parseFloat(basicDA) > 0 && joining < leaving
  }

  // Get today's date for max date validation
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <AssessmentHeader 
        title="ComplianceCheck"
        subtitle="Gratuity Calculator"
        badgeText="FREE Tool"
        badgeVariant="free"
      />

      <div className="max-w-2xl mx-auto py-8 px-4">

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <span className="flex items-center text-blue-600">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center text-green-600">
                  <Save className="w-3 h-3 mr-1" />
                  Saved
                </span>
              )}
              <span>{Math.round(getProgress())}%</span>
            </div>
          </div>
          <Progress value={getProgress()} className="h-2" aria-label="Calculator progress" />
        </div>

        {/* Restored Progress Notice */}
        {hasRestoredProgress && step === 1 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center justify-between">
            <span>Your previous progress has been restored.</span>
            <button 
              onClick={() => {
                clearProgress()
                setHasRestoredProgress(false)
                setStep(1)
                setUserDetails(null)
                setEmploymentType(null)
                setBasicDA('')
                setDateOfJoining('')
                setLastWorkingDate('')
                setResult(null)
              }}
              className="text-blue-600 hover:underline"
            >
              Start Fresh
            </button>
          </div>
        )}

        {/* Step 1: User Details - Simplified */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  2025 Labour Code Rules
                </Badge>
              </div>
              <CardTitle className="text-2xl">Gratuity Calculator</CardTitle>
              <CardDescription>
                Calculate your gratuity based on the new Labour Codes. 
                Fixed-term employees are now eligible after just 1 year!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onUserDetailsSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" {...register('fullName')} placeholder="Your full name" />
                  {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" {...register('email')} placeholder="you@example.com" />
                    {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-gray-600 bg-gray-100 border border-r-0 rounded-l-md">
                        +91
                      </span>
                      <Input id="phone" {...register('phone')} placeholder="9876543210" className="rounded-l-none" />
                    </div>
                    {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Continue to Calculator <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Calculator Inputs */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Info Card */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">New Labour Code Update (2025)</p>
                    <p>Fixed-term employees are now eligible for gratuity after just 1 year of service (previously 5 years). The calculation formula remains the same.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
                <CardDescription>Enter your employment details to calculate gratuity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Employment Type */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">What is your employment type?</Label>
                  <div className="space-y-2">
                    {EMPLOYMENT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setEmploymentType(type.value)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          employmentType === type.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{type.label}</span>
                            {type.value === 'fixed_term' && (
                              <Badge className="ml-2 bg-green-100 text-green-700 text-xs">NEW</Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">Min {type.minYears} year(s)</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date of Joining */}
                <div className="space-y-3">
                  <Label htmlFor="dateOfJoining" className="text-base font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Joining
                  </Label>
                  <p className="text-sm text-gray-500">
                    The date you started working with this employer.
                  </p>
                  <Input
                    id="dateOfJoining"
                    type="date"
                    value={dateOfJoining}
                    onChange={(e) => setDateOfJoining(e.target.value)}
                    max={today}
                    className="w-full"
                  />
                </div>

                {/* Last Working Date */}
                <div className="space-y-3">
                  <Label htmlFor="lastWorkingDate" className="text-base font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Last Working Date
                  </Label>
                  <p className="text-sm text-gray-500">
                    Your final day of employment (or expected exit date).
                  </p>
                  <Input
                    id="lastWorkingDate"
                    type="date"
                    value={lastWorkingDate}
                    onChange={(e) => setLastWorkingDate(e.target.value)}
                    min={dateOfJoining || undefined}
                    className="w-full"
                  />
                </div>

                {/* Basic + DA */}
                <div className="space-y-3">
                  <Label htmlFor="basicDA" className="text-base font-medium">
                    Last drawn Basic Salary + Dearness Allowance (monthly)
                  </Label>
                  <p className="text-sm text-gray-500">
                    Enter only Basic + DA. Do not include HRA, bonuses, or other allowances.
                  </p>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-gray-600 bg-gray-100 border border-r-0 rounded-l-md">
                      {RUPEE}
                    </span>
                    <Input
                      id="basicDA"
                      type="number"
                      value={basicDA}
                      onChange={(e) => setBasicDA(e.target.value)}
                      placeholder="e.g., 50000"
                      className="rounded-l-none"
                      min="0"
                    />
                  </div>
                </div>

                {/* Calculate Button */}
                <div className="pt-4 space-y-3">
                  <Button
                    onClick={handleCalculate}
                    disabled={!isCalculatorValid() || isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate Gratuity
                      </>
                    )}
                  </Button>
                  
                  <Button variant="ghost" onClick={() => setStep(1)} className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <div className="space-y-6">
            {/* Main Result Card */}
            <Card className={result.isEligible ? 'border-green-200' : 'border-amber-200'}>
              <CardHeader className={result.isEligible ? 'bg-green-50' : 'bg-amber-50'}>
                <div className="flex items-center gap-2">
                  {result.isEligible ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  )}
                  <CardTitle>
                    {result.isEligible ? 'You are eligible for gratuity!' : 'Not yet eligible'}
                  </CardTitle>
                </div>
                <CardDescription>{result.eligibilityReason}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Gratuity Amount */}
                <div className="text-center p-6 bg-gray-50 rounded-lg mb-6">
                  <div className="text-sm text-gray-500 mb-1">
                    {result.isEligible ? 'Your Gratuity Amount' : 'Potential Gratuity Amount'}
                  </div>
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {formatCurrency(result.cappedAmount)}
                  </div>
                  {result.isCapped && (
                    <div className="text-sm text-amber-600">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Capped at maximum ceiling of {formatCurrency(GRATUITY_CONSTANTS.MAX_CEILING)}
                    </div>
                  )}
                </div>

                {/* Service Duration */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Service Duration</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{result.serviceDetails.years}</div>
                      <div className="text-sm text-gray-500">Years</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{result.serviceDetails.months}</div>
                      <div className="text-sm text-gray-500">Months</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{result.serviceDetails.days}</div>
                      <div className="text-sm text-gray-500">Days</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center">
                    Calculated as {result.serviceDetails.totalYearsForCalculation} year(s) for gratuity
                    {result.serviceDetails.months >= 6 && result.serviceDetails.months < 12 && 
                      ' (rounded up as service includes 6+ months)'}
                  </p>
                </div>

                {/* Calculation Breakdown */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Calculation Breakdown</h3>
                  
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="text-sm font-mono text-gray-800 text-center">
                      {result.formula}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-500">Daily Wage</div>
                      <div className="font-semibold">{formatCurrency(result.breakdown.dailyWage)}</div>
                      <div className="text-xs text-gray-400">Basic+DA / 26 days</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-500">Total Days</div>
                      <div className="font-semibold">{result.breakdown.totalDays} days</div>
                      <div className="text-xs text-gray-400">15 days x years</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-500">Gross Amount</div>
                      <div className="font-semibold">{formatCurrency(result.breakdown.grossAmount)}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-500">After Ceiling</div>
                      <div className="font-semibold text-green-600">{formatCurrency(result.cappedAmount)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Due Date - NEW FEATURE */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-lg">Payment Due Date</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    {result.compliance.paymentDueDate}
                  </div>
                  <p className="text-sm text-green-800">
                    Employer must pay gratuity within 30 days of your last working date.
                  </p>
                  <p className="text-xs text-amber-700 mt-2">
                    ⚠️ Delayed payment attracts simple interest at Government-notified rates.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Information */}
            <Card>
              <CardHeader>
                <CardTitle>Important Compliance Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">{GRATUITY_COMPLIANCE_INFO.payment.icon}</span>
                    <div>
                      <div className="font-medium">{GRATUITY_COMPLIANCE_INFO.payment.title}</div>
                      <div className="text-sm text-gray-600">{result.compliance.paymentDeadline}</div>
                      <div className="text-xs text-amber-600 mt-1">{GRATUITY_COMPLIANCE_INFO.payment.penalty}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">{GRATUITY_COMPLIANCE_INFO.insurance.icon}</span>
                    <div>
                      <div className="font-medium">{GRATUITY_COMPLIANCE_INFO.insurance.title}</div>
                      <div className="text-sm text-gray-600">{GRATUITY_COMPLIANCE_INFO.insurance.description}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">{GRATUITY_COMPLIANCE_INFO.exemption.icon}</span>
                    <div>
                      <div className="font-medium">{GRATUITY_COMPLIANCE_INFO.exemption.title}</div>
                      <div className="text-sm text-gray-600">{result.compliance.taxExemption}</div>
                    </div>
                  </div>
                </div>

                {/* Fixed-Term Highlight */}
                {employmentType === 'fixed_term' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-100 text-green-700">NEW RULE</Badge>
                      <span className="font-medium text-green-800">Fixed-Term Employee Benefit</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Under the new Labour Codes, fixed-term employees are entitled to gratuity 
                      on a pro-rata basis after completing just 1 year of service. Previously, 
                      this benefit required 5 years of continuous service.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions - No Save Button */}
            <div className="space-y-3">
              <Button variant="outline" onClick={() => setStep(2)} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" /> Modify Inputs
              </Button>

              <Button variant="ghost" asChild className="w-full">
                <Link href="/">
                  Back to Home
                </Link>
              </Button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 text-center">
              This calculator provides an estimate based on the Payment of Gratuity Act, 1972 
              and new Labour Codes. Actual gratuity may vary based on company policies and 
              specific circumstances. Consult a qualified professional for accurate advice.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
