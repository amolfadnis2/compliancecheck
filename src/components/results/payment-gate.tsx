'use client'

import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { analytics } from '@/lib/analytics/tracking'
import type { AssessmentType } from '@/lib/constants/assessment-types'
import { getSampleReportPath } from '@/lib/pdf/sample-report-paths'

// Minimal type for the client-side Razorpay Checkout widget
interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description: string
  prefill?: { email?: string }
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void
  modal?: { ondismiss?: () => void }
}

interface RazorpayInstance {
  open: () => void
  on: (event: 'payment.failed', cb: (response: { error?: { description?: string } }) => void) => void
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (document.getElementById('razorpay-checkout-js')) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = 'razorpay-checkout-js'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.head.appendChild(script)
  })
}

interface PaymentGateProps {
  title?: string
  description?: string
  priceINR: number
  features?: string[]
  onPaid: () => void
  // Provide these to enable live Razorpay + promo flow.
  // Omitting them falls back to beta (calls onPaid directly).
  assessmentId?: string
  assessmentType?: AssessmentType
}

export function PaymentGate({
  title = 'Unlock your full compliance report',
  description,
  priceINR,
  features = [
    'Full gap analysis with exact legal provisions',
    'Priority-ranked action plan',
    'Per-issue penalty exposure',
    'Downloadable PDF report',
  ],
  onPaid,
  assessmentId,
  assessmentType,
}: PaymentGateProps) {
  const [email, setEmail] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [showPromo, setShowPromo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLiveMode = !!assessmentId && !!assessmentType
  // "See what you get before you pay" — the report is the product, so a buyer
  // deciding on a few thousand rupees should be able to read one first.
  const samplePath = assessmentType ? getSampleReportPath(assessmentType) : null

  // Funnel props shared by every payment event from this gate.
  const funnel = isLiveMode
    ? { assessment_type: assessmentType!, assessment_id: assessmentId!, amount_inr: priceINR }
    : null

  useEffect(() => {
    if (funnel) {
      analytics.paywallViewed(funnel)
    } else {
      analytics.pricingPageViewed({ source: 'assessment_complete', current_tier: 'free', assessment_type: assessmentType })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const handlePayClick = async () => {
    if (!funnel) {
      // Beta stub: not a real checkout, so record a feature-gate hit rather
      // than polluting checkout conversion metrics
      analytics.featureGateHit({ feature: 'pdf_export', current_tier: 'free', attempted_action: 'view_paid_report', assessment_type: assessmentType })
      onPaid()
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    analytics.checkoutStarted(funnel)

    setLoading(true)
    setError(null)

    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, assessmentType, email }),
      })
      const orderData = await orderRes.json()

      if (orderData.alreadyPaid) {
        onPaid()
        return
      }
      if (!orderRes.ok) {
        analytics.paymentFailed({ ...funnel, stage: 'create_order', error: orderData.error })
        throw new Error(orderData.error || 'Failed to create order')
      }

      await loadRazorpayScript()

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'ComplianceCheck',
        description: 'Compliance Assessment Report',
        prefill: { email },
        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                assessmentId,
                assessmentType,
                email,
              }),
            })
            if (verifyRes.ok) {
              analytics.paymentSucceeded({ ...funnel, payment_method: 'razorpay', source: 'client' })
              onPaid()
            } else {
              const err = await verifyRes.json()
              analytics.paymentFailed({ ...funnel, stage: 'verify', error: err.error })
              setError(err.error || 'Payment verification failed. Contact support.')
            }
          } catch {
            analytics.paymentFailed({ ...funnel, stage: 'verify' })
            setError('Payment verification failed. Contact support.')
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            analytics.checkoutAbandoned(funnel)
            setLoading(false)
          },
        },
      })
      rzp.on('payment.failed', (response) => {
        analytics.paymentFailed({ ...funnel, stage: 'checkout', error: response.error?.description })
      })
      rzp.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const handlePromoApply = async () => {
    if (!funnel) return
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }
    if (!promoCode.trim()) {
      setError('Please enter a promo code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/payment/redeem-waiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, assessmentType, code: promoCode, email }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Invalid promo code')

      analytics.promoRedeemed({ ...funnel, succeeded: true })
      analytics.paymentSucceeded({ ...funnel, payment_method: 'waiver', source: 'client' })
      onPaid()
    } catch (err) {
      analytics.promoRedeemed({ ...funnel, succeeded: false, error: err instanceof Error ? err.message : undefined })
      setError(err instanceof Error ? err.message : 'Invalid promo code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-2xl font-bold text-blue-900">
            ₹{priceINR.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-blue-700 mt-1">One-time assessment report</p>
        </div>

        <ul className="text-sm text-gray-600 space-y-1.5">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>

        {samplePath && (
          <a
            href={samplePath}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm font-medium text-blue-700 hover:text-blue-800 underline"
          >
            See a full sample report before you pay (PDF)
          </a>
        )}

        {isLiveMode && (
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Your email (for receipt)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button
          onClick={handlePayClick}
          disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-800 h-12"
        >
          {loading ? 'Processing…' : isLiveMode ? `Pay ₹${priceINR.toLocaleString('en-IN')} & Unlock` : 'Free in beta — View Report'}
        </Button>

        {isLiveMode && (
          <p className="text-xs text-gray-500 text-center">
            Not useful? Reply to your receipt email within 7 days for a full refund.
          </p>
        )}

        {isLiveMode && (
          <div className="text-center">
            {!showPromo ? (
              <button
                onClick={() => setShowPromo(true)}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Have a promo code?
              </button>
            ) : (
              <div className="space-y-2 mt-2">
                <Input
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  disabled={loading}
                  className="text-center uppercase"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePromoApply}
                  disabled={loading}
                  className="w-full"
                >
                  Apply code
                </Button>
              </div>
            )}
          </div>
        )}

        {!isLiveMode && (
          <p className="text-xs text-gray-400 text-center">Payment will be enabled in a future release.</p>
        )}
      </CardContent>
    </Card>
  )
}
