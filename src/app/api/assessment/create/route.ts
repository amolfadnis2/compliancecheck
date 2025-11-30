import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Razorpay from 'razorpay'

// Initialize Supabase conditionally
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Lazy initialization of Razorpay (only when actually called)
function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured')
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  })
}

export async function POST(request: Request) {
  try {
    // Check if credentials are configured
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    const razorpay = getRazorpay()
    
    const body = await request.json()
    const { userDetails, responses, assessmentType, amount } = body

    // Validate required fields
    if (!userDetails || !responses || !assessmentType || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount, // in paise
      currency: 'INR',
      receipt: `assessment_${Date.now()}`,
      notes: {
        email: userDetails.email,
        assessmentType: assessmentType,
      },
    })

    // Calculate GST (18% of base amount)
    const baseAmount = Math.round(amount / 1.18)
    const gstAmount = amount - baseAmount

    // Create payment record
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        razorpay_order_id: order.id,
        amount: amount,
        currency: 'INR',
        gst_amount: gstAmount,
        product_type: assessmentType,
        status: 'created',
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      )
    }

    // Create assessment record
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        payment_id: paymentData.id,
        assessment_type: assessmentType,
        status: 'paid', // Will be verified after payment
        responses: {
          userDetails,
          answers: responses,
        },
      })
      .select()
      .single()

    if (assessmentError) {
      console.error('Assessment creation error:', assessmentError)
      return NextResponse.json(
        { error: 'Failed to create assessment record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      orderId: order.id,
      amount: amount,
      assessmentId: assessmentData.id,
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
