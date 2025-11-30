import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Lazy initialization - don't create client at module level
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  try {
    // Check environment variables at runtime
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET
    if (!razorpaySecret) {
      return NextResponse.json(
        { error: 'Payment verification not configured' },
        { status: 503 }
      )
    }

    // Create client inside the function
    const supabase = createClient(supabaseUrl, supabaseKey)

    const body = await request.json()
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature, 
      assessmentId 
    } = body

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !assessmentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Update payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id)

    if (paymentError) {
      console.error('Payment update error:', paymentError)
      return NextResponse.json(
        { error: 'Failed to update payment record' },
        { status: 500 }
      )
    }

    // Update assessment status to completed
    const { error: assessmentError } = await supabase
      .from('assessments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)

    if (assessmentError) {
      console.error('Assessment update error:', assessmentError)
      return NextResponse.json(
        { error: 'Failed to update assessment record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      assessmentId,
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
