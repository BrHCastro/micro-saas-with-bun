import type { Request, Response } from 'express'
import { z } from 'zod'
import {
  handleProcessWebhookCheckout,
  handleProcessWebhookUpdateSubscription,
  stripe,
} from '../../lib/stripe'
import { config } from '../../config'
import Stripe from 'stripe'

export async function stripeWebhookController(
  request: Request,
  response: Response,
) {
  const requestHeaders = z.object({
    'stripe-signature': z.string(),
  })

  const header = requestHeaders.safeParse(request.headers)

  if (header.success === false) {
    return response.status(403).json({ error: 'Signature not provided.' })
  }

  let event = request.body

  const signature = header.data['stripe-signature']

  try {
    event = await stripe.webhooks.constructEventAsync(
      request.body,
      signature,
      config.stripe.webHookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('⚠️ Webhook signature verification failed.', errorMessage)
    return response.sendStatus(400)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleProcessWebhookCheckout(event)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleProcessWebhookUpdateSubscription(event)
        break
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return response.json({ received: true })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(errorMessage)
    return response.status(500).json({ error: errorMessage })
  }
}
