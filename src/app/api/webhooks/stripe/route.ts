import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { StripeWebhookPayload } from '@/types'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

async function handleCheckoutSessionCompleted(data: any) {
  const supabase = await createClient()
  const customerId = data.customer

  if (!customerId) {
    console.error('No customer ID in checkout session')
    return
  }

  try {
    const customer = await stripe.customers.retrieve(customerId)
    const email = customer.email

    if (!email) {
      console.error('No email for customer')
      return
    }

    const { data: userData, error: getUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (getUserError) {
      console.error('Error finding user:', getUserError)
      return
    }

    await supabase
      .from('users')
      .update({
        stripe_customer_id: customerId,
        subscription_status: 'active',
      })
      .eq('id', userData.id)
  } catch (error) {
    console.error('Error handling checkout session:', error)
  }
}

async function handleSubscriptionUpdated(data: any) {
  const supabase = await createClient()

  try {
    const customer = await stripe.customers.retrieve(data.customer as string)
    const email = customer.email

    if (!email) {
      console.error('No email for customer')
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userData) {
      const status = data.status === 'active' ? 'active' : 'canceled'
      await supabase
        .from('users')
        .update({
          subscription_status: status,
        })
        .eq('id', userData.id)
    }
  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

async function handleSubscriptionDeleted(data: any) {
  const supabase = await createClient()

  try {
    const customer = await stripe.customers.retrieve(data.customer as string)
    const email = customer.email

    if (!email) {
      console.error('No email for customer')
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userData) {
      await supabase
        .from('users')
        .update({
          subscription_status: 'canceled',
        })
        .eq('id', userData.id)
    }
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const webhookPayload = event.data as any

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(webhookPayload.object)
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(webhookPayload.object)
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(webhookPayload.object)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
