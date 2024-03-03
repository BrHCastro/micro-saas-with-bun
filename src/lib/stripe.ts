import Stripe from 'stripe'
import { config } from '../config'
import { env } from '../env'

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
})

export async function createCheckoutSession(userId: string) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      client_reference_id: userId,
      success_url: env.STRIPE_SUCCESS_URL,
      cancel_url: env.STRIPE_CANCEL_URL,
      line_items: [
        {
          price: config.stripe.proPriceId,
          quantity: 1,
        },
      ],
    })

    return {
      url: session.url,
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : err)
  }
}

export function handleProcessWebhookCheckout() {}

export function handleProcessWebhookUpdateSubscription() {}
