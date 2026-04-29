'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calculator, CheckCircle, AlertTriangle, Info, TrendingUp, DollarSign } from 'lucide-react'
import { AssessmentHeader } from '@/components/assessment/assessment-header'
import { RUPEE, INDIAN_STATES } from '@/lib/constants'
import {
  calculateCTC,
  formatCurrency,
  type CTCInput,
  type CTCResult,
} from '@/lib/calculators/ctc-calculator'
import { trackEvent } from '@/lib/analytics'
import { EmailGate } from '@/components/identity/EmailGate'
import { shouldShowCTCEmailGate } from '@/lib/feature-flags'
import { logEvent } from '@/lib/identity/log-event'

// Form validation schema
const userDetailsSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number').optional().or(z.literal('')),
})

type UserDetails = z.infer<typeof userDetailsSchema>

// Local storage key
const STORAGE_KEY = 'ctc_calculator_progress'

interface SavedProgress {
  step: number
  userDetails: UserDetails | null
  savedAt: string
}

export default function CTCCalculatorPage() {
  const [step, setStep] = useState(1)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)

  // Calculator input states
  const [annualCTC, setAnnualCTC] = useState<string>('')
  const [state, setState] = useState<string>('')
  const [isMetroCity, setIsMetroCity] = useState<string>('')
  const [taxRegime, setTaxRegime] = useState<'new' | 'old'>('new')
  const [gender, setGender] = useState<'male' | 'female'>('male')

  // Optional deductions for Old Regime
  const [section80C, setSection80C] = useState<string>('')
  const [section80D, setSection80D] = useState<string>('')
  const [rentPaid, setRentPaid] = useState<string>('')

  // Result state
  const [result, setResult] = useState<CTCResult | null>(null)

  // Email gate: evaluate once on mount (stable per session)
  const [gateRequired, setGateRequired] = useState(false)
  const [gateCleared, setGateCleared] = useState(false)

  useEffect(() => {
    setGateRequired(shouldShowCTCEmailGate())
  }, [])

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
        }
      }
    } catch (e) {
      console.error('Error loading saved progress:', e)
    }
  }, [reset])

  // Auto-save progress
  const saveProgress = useCallback(() => {
    try {
      const progress: SavedProgress = {
        step,
        userDetails,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch (e) {
      console.error('Error saving progress:', e)
    }
  }, [step, userDetails])

  // Clear saved progress
  const clearProgress = () => {
    localStorage.removeItem(STORAGE_KEY)
  }

  // Handle user details submission
  const onUserDetailsSubmit = (data: UserDetails) => {
    setUserDetails(data)
    setStep(2)
    saveProgress()
    
    trackEvent('calculator_started', {
      calculator_type: 'ctc',
      has_phone: !!data.phone,
    })
  }

  // Handle calculation
  const handleCalculate = () => {
    if (!annualCTC || !state || !isMetroCity) {
      alert('Please fill all required fields')
      return
    }

    const input: CTCInput = {
      annualCTC: parseFloat(annualCTC),
      state,
      isMetroCity: isMetroCity === 'yes',
      taxRegime,
      gender: state === 'Maharashtra' ? gender : undefined,
      section80C: section80C ? parseFloat(section80C) : undefined,
      section80D: section80D ? parseFloat(section80D) : undefined,
      rentPaid: rentPaid ? parseFloat(rentPaid) : undefined,
    }

    const calcResult = calculateCTC(input)
    setResult(calcResult)
    setStep(3)

    // Auto-save to database
    saveToDatabase(calcResult, input)

    if (gateRequired) {
      trackEvent('ctc_calc_gate_shown', { gate_variant: 'on' })
    }

    logEvent('calculator_completed', { calculator_type: 'ctc', annual_ctc: input.annualCTC })

    trackEvent('calculator_completed', {
      calculator_type: 'ctc',
      annual_ctc: input.annualCTC,
      state: input.state,
      tax_regime: input.taxRegime,
      recommended_regime: calcResult.recommendedRegime,
    })
  }

  // Auto-save to database
  const saveToDatabase = async (calcResult: CTCResult, inputs: CTCInput) => {
    if (!userDetails) return
    
    try {
      await fetch('/api/calculator/ctc-submit', {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AssessmentHeader 
        title="CTC to In-Hand Calculator"
        subtitle="Based on 2025 Labour Code rules"
        badgeText="ALWAYS FREE"
        badgeVariant="free"
      />

      <div className="max-w-4xl mx-auto px-4 py-8 pt-32">
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-6 h-6 text-blue-600" />
                Your Details
              </CardTitle>
              <CardDescription>
                We&apos;ll email your calculation report. Your data is saved securely.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onUserDetailsSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    {...register('fullName')}
                    placeholder="John Doe"
                  />
                  {errors.fullName && (
                    <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Mobile Number (Optional)</Label>
                  <div className="flex gap-2">
                    <div className="w-16 flex items-center justify-center border rounded-md bg-gray-50 text-gray-600">
                      +91
                    </div>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Continue to Calculator
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-blue-600" />
                Salary & Location Details
              </CardTitle>
              <CardDescription>
                Enter your CTC and location for accurate calculation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="ctc">Annual CTC *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{RUPEE}</span>
                  <Input
                    id="ctc"
                    type="number"
                    value={annualCTC}
                    onChange={(e) => setAnnualCTC(e.target.value)}
                    placeholder="600000"
                    className="pl-8"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Your total Cost to Company per year</p>
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your work state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Required for Professional Tax calculation</p>
              </div>

              <div>
                <Label>Metro City *</Label>
                <Select value={isMetroCity} onValueChange={setIsMetroCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Is your city a metro?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes (Delhi, Mumbai, Kolkata, Chennai)</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Affects HRA calculation</p>
              </div>

              {state === 'Maharashtra' && (
                <div>
                  <Label>Gender *</Label>
                  <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Maharashtra has different PT rates for women</p>
                </div>
              )}

              <div>
                <Label>Tax Regime *</Label>
                <Select value={taxRegime} onValueChange={(v) => setTaxRegime(v as 'new' | 'old')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Regime (Default)</SelectItem>
                    <SelectItem value="old">Old Regime (With Deductions)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">We&apos;ll compare both regimes in results</p>
              </div>

              {taxRegime === 'old' && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-medium text-sm text-gray-700">Optional Deductions (Old Regime)</h3>
                  
                  <div>
                    <Label htmlFor="section80C">Section 80C (EPF, PPF, ELSS, etc.)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{RUPEE}</span>
                      <Input
                        id="section80C"
                        type="number"
                        value={section80C}
                        onChange={(e) => setSection80C(e.target.value)}
                        placeholder="0"
                        className="pl-8"
                        min="0"
                        max="150000"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Max {RUPEE}1,50,000</p>
                  </div>

                  <div>
                    <Label htmlFor="section80D">Section 80D (Health Insurance)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{RUPEE}</span>
                      <Input
                        id="section80D"
                        type="number"
                        value={section80D}
                        onChange={(e) => setSection80D(e.target.value)}
                        placeholder="0"
                        className="pl-8"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="rentPaid">Annual Rent Paid</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{RUPEE}</span>
                      <Input
                        id="rentPaid"
                        type="number"
                        value={rentPaid}
                        onChange={(e) => setRentPaid(e.target.value)}
                        placeholder="0"
                        className="pl-8"
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">For HRA exemption calculation</p>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleCalculate} 
                className="w-full" 
                size="lg"
                disabled={!annualCTC || !state || !isMetroCity}
              >
                Calculate In-Hand Salary
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 3 && result && (
          <div className="space-y-6">
            {/* Email gate — shown before results when flag is active */}
            {gateRequired && !gateCleared && (
              <EmailGate
                source="ctc_calc"
                reason="Email me my CTC breakdown so I can refer back to it"
                onVerified={() => {
                  setGateCleared(true)
                  trackEvent('ctc_calc_gate_completed', { source: 'ctc_calc' })
                }}
                showMarketingConsent
                showDeadlineRemindersConsent={false}
                ctaLabel="Verify & see results"
              />
            )}

            {/* Results — hidden behind gate until cleared */}
            {(!gateRequired || gateCleared) && (
            <>
            {/* Summary Card */}
            <Card className="border-2 border-green-600">
              <CardHeader className="bg-green-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Monthly In-Hand Salary</CardTitle>
                    <CardDescription>After all deductions</CardDescription>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-green-600 mb-2">
                    {formatCurrency(result.breakdown.monthlyInHand)}
                  </div>
                  <div className="text-gray-600">
                    Annual: {formatCurrency(result.breakdown.annualInHand)}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-600">Gross Pay</div>
                    <div className="font-semibold">{formatCurrency(result.breakdown.monthlyGross)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Deductions</div>
                    <div className="font-semibold text-red-600">
                      {formatCurrency(
                        result.breakdown.employeePF + 
                        result.breakdown.employeeESI + 
                        result.breakdown.professionalTax + 
                        result.breakdown.tds
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Take-Home %</div>
                    <div className="font-semibold">
                      {((result.breakdown.monthlyInHand / result.breakdown.monthlyGross) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTC Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>CTC Breakdown</CardTitle>
                <CardDescription>Monthly components as per 2025 Labour Codes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-medium">Basic Salary (50%)</span>
                    <span className="font-semibold">{formatCurrency(result.breakdown.monthlyBasic)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">HRA</span>
                    <span>{formatCurrency(result.breakdown.monthlyHRA)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Special Allowance</span>
                    <span>{formatCurrency(result.breakdown.monthlySpecialAllowance)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t font-semibold">
                    <span>Monthly Gross</span>
                    <span>{formatCurrency(result.breakdown.monthlyGross)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-gray-700">Employee Deductions</h3>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">EPF (12%)</span>
                    <span className="text-red-600">-{formatCurrency(result.breakdown.employeePF)}</span>
                  </div>
                  {result.breakdown.employeeESI > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">ESI (0.75%)</span>
                      <span className="text-red-600">-{formatCurrency(result.breakdown.employeeESI)}</span>
                    </div>
                  )}
                  {result.breakdown.professionalTax > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Professional Tax</span>
                      <span className="text-red-600">-{formatCurrency(result.breakdown.professionalTax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Income Tax (TDS)</span>
                    <span className="text-red-600">-{formatCurrency(result.breakdown.tds)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Regime Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Tax Regime Comparison
                </CardTitle>
                <CardDescription>Which regime saves you more tax?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* New Regime */}
                  <div className={`p-4 rounded-lg border-2 ${result.recommendedRegime === 'new' ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">New Regime</h3>
                      {result.recommendedRegime === 'new' && (
                        <Badge className="bg-green-600">Recommended</Badge>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gross Salary</span>
                        <span>{formatCurrency(result.newRegimeTax.grossSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Std. Deduction</span>
                        <span className="text-green-600">-{formatCurrency(result.newRegimeTax.standardDeduction)}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Taxable Income</span>
                        <span>{formatCurrency(result.newRegimeTax.taxableIncome)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2">
                        <span>Annual Tax</span>
                        <span className="text-red-600">{formatCurrency(result.newRegimeTax.netTax)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Old Regime */}
                  <div className={`p-4 rounded-lg border-2 ${result.recommendedRegime === 'old' ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Old Regime</h3>
                      {result.recommendedRegime === 'old' && (
                        <Badge className="bg-green-600">Recommended</Badge>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gross Salary</span>
                        <span>{formatCurrency(result.oldRegimeTax.grossSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Deductions</span>
                        <span className="text-green-600">-{formatCurrency(result.oldRegimeTax.totalDeductions)}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Taxable Income</span>
                        <span>{formatCurrency(result.oldRegimeTax.taxableIncome)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2">
                        <span>Annual Tax</span>
                        <span className="text-red-600">{formatCurrency(result.oldRegimeTax.netTax)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {result.taxSavings > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-900">
                      <Info className="w-5 h-5" />
                      <span className="font-medium">
                        {result.recommendedRegime === 'new' ? 'New' : 'Old'} Regime saves you {formatCurrency(result.taxSavings)} annually
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compliance Notes */}
            {result.complianceNotes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Notes</CardTitle>
                  <CardDescription>Key points based on 2025 Labour Codes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.complianceNotes.map((note, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        {note.includes('Warning') && <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />}
                        {note.includes('Tick') && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />}
                        {note.includes('Bulb') && <Info className="w-4 h-4 text-blue-600 mt-0.5" />}
                        <span className="text-gray-700">{note.replace(/^(Warning:|Tick:|Bulb:)\s*/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep(2)
                  setResult(null)
                }}
              >
                Recalculate
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Back to Home
                </Button>
              </Link>
            </div>
            </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
