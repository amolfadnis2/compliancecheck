'use client'

import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface PaymentGateProps {
  title?: string
  description?: string
  priceINR: number
  features?: string[]
  onPaid: () => void
}

export function PaymentGate({
  title = 'Unlock your full compliance report',
  description,
  priceINR,
  features = [
    'Full gap analysis with remediation plan',
    'Priority-ranked action items',
    'Downloadable PDF report',
    'Email report to your inbox',
  ],
  onPaid,
}: PaymentGateProps) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-2xl font-bold text-blue-900">
            Rs.{priceINR.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-blue-700 mt-1">One-time assessment report</p>
        </div>
        <ul className="text-sm text-gray-600 space-y-1.5">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>
        <Button onClick={onPaid} className="w-full bg-blue-700 hover:bg-blue-800 h-12">
          Free in beta — View Report
        </Button>
        <p className="text-xs text-gray-400 text-center">Payment will be enabled in a future release.</p>
      </CardContent>
    </Card>
  )
}
