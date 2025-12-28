# Assessment Page Template

Copy this template when creating a new assessment page.

## Standard Imports

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, CheckCircle, XCircle, Loader2, Download, FileText } from 'lucide-react'
import { AssessmentHeader } from '@/components/assessment/assessment-header'
import { INDIAN_STATES, EMPLOYEE_COUNT_OPTIONS, INDUSTRY_OPTIONS } from '@/lib/constants'
import { ASSESSMENT_TYPES, getLocalStorageKey } from '@/lib/constants/assessment-types'
import { ANALYTICS_EVENTS } from '@/lib/analytics/events'
import posthog from 'posthog-js'
```

## User Details Schema

```typescript
const userDetailsSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  companyName: z.string().min(2, 'Company name is required').max(200),
  state: z.string().min(1, 'Please select your state'),
  employeeCount: z.string().min(1, 'Please select employee count'),
  industry: z.string().min(1, 'Please select your industry'),
})

type UserDetails = z.infer<typeof userDetailsSchema>
```

## State Management

```typescript
export default function NewAssessmentPage() {
  const router = useRouter()
  const [step, setStep] = useState(0) // 0 = details, 1+ = questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime] = useState(Date.now())

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<UserDetails>({
    resolver: zodResolver(userDetailsSchema),
  })
```

## Company Details Form (Step 0)

```tsx
{step === 0 && (
  <Card className="max-w-2xl mx-auto">
    <CardHeader>
      <CardTitle>Company Details</CardTitle>
      <CardDescription>Tell us about your organization</CardDescription>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleSubmit(onUserDetailsSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input id="fullName" {...register('fullName')} placeholder="John Doe" />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register('email')} placeholder="john@company.com" />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Mobile Number *</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              +91
            </span>
            <Input id="phone" {...register('phone')} placeholder="9876543210" className="rounded-l-none" />
          </div>
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input id="companyName" {...register('companyName')} placeholder="ABC Pvt Ltd" />
          {errors.companyName && <p className="text-sm text-red-500">{errors.companyName.message}</p>}
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label>Registered State *</Label>
          <Select onValueChange={(value) => setValue('state', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES.map((state) => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
        </div>

        {/* Employee Count */}
        <div className="space-y-2">
          <Label>Number of Employees *</Label>
          <Select onValueChange={(value) => setValue('employeeCount', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee count" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYEE_COUNT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.employeeCount && <p className="text-sm text-red-500">{errors.employeeCount.message}</p>}
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <Label>Industry *</Label>
          <Select onValueChange={(value) => setValue('industry', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && <p className="text-sm text-red-500">{errors.industry.message}</p>}
        </div>

        <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800">
          Start Assessment ({filteredQuestions.length} questions)
        </Button>
      </form>
    </CardContent>
  </Card>
)}
```

## Yes/No Question Component

```tsx
{step > 0 && currentQuestion?.type === 'yes_no' && (
  <Card className="max-w-2xl mx-auto">
    <CardHeader>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">
          {currentQuestion.category}
        </span>
        <span className="text-sm text-gray-500">
          {currentQuestionIndex + 1} of {filteredQuestions.length}
        </span>
      </div>
      <Progress 
        value={(currentQuestionIndex / filteredQuestions.length) * 100} 
        aria-label="Assessment progress"
        className="h-2 mb-4"
      />
      <CardTitle className="text-lg">{currentQuestion.text}</CardTitle>
      {currentQuestion.helpText && (
        <CardDescription>{currentQuestion.helpText}</CardDescription>
      )}
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => handleAnswer('yes')}
          variant={responses[currentQuestion.id] === 'yes' ? 'default' : 'outline'}
          className={`h-16 text-lg ${
            responses[currentQuestion.id] === 'yes' 
              ? 'bg-green-700 hover:bg-green-800 text-white' 
              : ''
          }`}
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          Yes
        </Button>
        <Button
          onClick={() => handleAnswer('no')}
          variant={responses[currentQuestion.id] === 'no' ? 'default' : 'outline'}
          className={`h-16 text-lg ${
            responses[currentQuestion.id] === 'no' 
              ? 'bg-red-700 hover:bg-red-800 text-white' 
              : ''
          }`}
        >
          <XCircle className="mr-2 h-5 w-5" />
          No
        </Button>
      </div>
    </CardContent>
  </Card>
)}
```

## Auto-Advance Handler

```typescript
const handleAnswer = (answer: string) => {
  setResponses(prev => ({ ...prev, [currentQuestion.id]: answer }))

  // Track progress
  posthog.capture(ANALYTICS_EVENTS.ASSESSMENT_PROGRESS, {
    assessment_type: ASSESSMENT_TYPES.NEW_ASSESSMENT,
    completion_percentage: Math.round(((currentQuestionIndex + 1) / filteredQuestions.length) * 100),
    current_category: currentQuestion.category,
    time_spent_seconds: Math.floor((Date.now() - startTime) / 1000)
  })

  // Auto-advance after 800ms
  setTimeout(() => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }, 800)
}
```

## Scoring Algorithm

```typescript
const calculateScore = (): { overall: number; categories: Record<string, number> } => {
  const categoryScores: Record<string, { earned: number; total: number }> = {}

  filteredQuestions.forEach(q => {
    if (!categoryScores[q.category]) {
      categoryScores[q.category] = { earned: 0, total: 0 }
    }

    if (q.complianceAnswer) {
      categoryScores[q.category].total += q.weight
      if (responses[q.id] === q.complianceAnswer) {
        categoryScores[q.category].earned += q.weight
      }
    }
  })

  let totalEarned = 0
  let totalWeight = 0
  const categories: Record<string, number> = {}

  Object.entries(categoryScores).forEach(([cat, scores]) => {
    totalEarned += scores.earned
    totalWeight += scores.total
    categories[cat] = scores.total > 0 
      ? Math.round((scores.earned / scores.total) * 100) 
      : 100
  })

  return {
    overall: totalWeight > 0 ? Math.round((totalEarned / totalWeight) * 100) : 100,
    categories
  }
}
```

## Submit Handler

```typescript
const handleSubmit = async () => {
  setIsSubmitting(true)
  
  try {
    const { overall, categories } = calculateScore()
    const actionItems = generateActionItems()

    // Track completion
    posthog.capture(ANALYTICS_EVENTS.ASSESSMENT_COMPLETED, {
      assessment_type: ASSESSMENT_TYPES.NEW_ASSESSMENT,
      compliance_score: overall,
      gap_count: actionItems.length,
      high_priority_gaps: actionItems.filter(a => a.priority === 'high').length,
      time_to_complete_seconds: Math.floor((Date.now() - startTime) / 1000),
      questions_answered: Object.keys(responses).length,
      questions_skipped: 0
    })

    const response = await fetch('/api/assessment/new-type-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userDetails,
        responses,
        score: overall,
        categoryScores: categories,
        actionItems,
        assessmentType: ASSESSMENT_TYPES.NEW_ASSESSMENT,
      }),
    })

    const data = await response.json()
    
    if (data.success) {
      // Store in localStorage for results page
      localStorage.setItem(getLocalStorageKey(data.assessmentId), JSON.stringify({
        userDetails,
        responses,
        score: overall,
        categoryScores: categories,
        actionItems,
        completedAt: new Date().toISOString()
      }))
      
      router.push(`/results/${data.assessmentId}`)
    }
  } catch (error) {
    console.error('Submission error:', error)
  } finally {
    setIsSubmitting(false)
  }
}
```

## Action Items Generator

```typescript
const generateActionItems = () => {
  const items: Array<{ priority: 'high' | 'medium' | 'low'; text: string; category: string }> = []

  filteredQuestions.forEach(q => {
    if (q.complianceAnswer && responses[q.id] !== q.complianceAnswer) {
      items.push({
        priority: q.weight >= 8 ? 'high' : q.weight >= 5 ? 'medium' : 'low',
        text: `Address: ${q.text}`,
        category: q.category
      })
    }
  })

  // Sort by priority
  return items.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  })
}
```
