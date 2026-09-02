'use client'

import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { analytics } from '@/lib/analytics/tracking'
import { isPaymentLive, type AssessmentType } from '@/lib/constants/assessment-types'
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

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void }
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
  // A paid, live assessment can still land on the fallback: POSH passes
  // assessmentType unconditionally but assessmentId only once its Supabase
  // write succeeded, so a failed persist leaves a real ₹1,999 product on the
  // stub. Calling that "free in beta" is untrue, so the copy below splits the
  // two cases while the behaviour (unlock without charging) stays identical.
  const isUnpricedBeta = !isLiveMode && !(assessmentType && isPaymentLive(assessmentType))
  // "See what you get before you pay" — the report is the product, so a buyer
  // deciding on a few thousand rupees should be able to read one first.
  const samplePath = assessmentType ? getSampleReportPath(assessmentType) : null

  useEffect(() => {
    analytics.pricingPageViewed({ source: 'assessment_complete', current_tier: 'free', assessment_type: assessmentType })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const handlePayClick = async () => {
    if (!assessmentId || !assessmentType) {
      // Beta stub: not a real checkout, so record a feature-gate hit rather
      // than polluting checkout conversion metrics
      analytics.featureGateHit({ feature: 'pdf_export', current_tier: 'free', attempted_action: 'view_paid_report', assessment_type: assessmentType })
      onPaid()
      return
    }

    analytics.checkoutStarted({ plan: 'pro', billing_cycle: 'monthly', source: 'payment_gate', current_tier: 'free', assessment_type: assessmentType })

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

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
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order')

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
              analytics.paymentCompleted({
                assessment_type: assessmentType,
                amount_inr: priceINR,
                assessment_id: assessmentId,
              })
              onPaid()
            } else {
              const err = await verifyRes.json()
              setError(err.error || 'Payment verification failed. Contact support.')
            }
          } catch {
            setError('Payment verification failed. Contact support.')
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      })
      rzp.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const handlePromoApply = async () => {
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

      onPaid()
    } catch (err) {
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
          {loading
            ? 'Processing…'
            : isLiveMode
              ? `Pay ₹${priceINR.toLocaleString('en-IN')} & Unlock`
              : isUnpricedBeta
                ? 'Free in beta — View Report'
                : 'View Report — no charge this time'}
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
          <p className="text-xs text-gray-400 text-center">
            {isUnpricedBeta
              ? 'Payment will be enabled in a future release.'
              : "We couldn't start checkout for this report, so we've unlocked it at no charge. You have not been billed."}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
