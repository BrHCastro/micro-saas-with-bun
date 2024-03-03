import Stripe from 'stripe'
import { config } from '../config'
import { env } from '../env'
import { prisma } from './prisma'
import { z } from 'zod'

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

export async function getStripeCustomerByEmail(email: string) {
  const customers = await stripe.customers.list({
    email,
  })

  return customers.data[0]
}

export async function createStripeCustomer(input: {
  email: string
  name: string
}) {
  let customer = await getStripeCustomerByEmail(input.email)

  if (customer) return customer

  customer = await stripe.customers.create({
    email: input.email,
    name: input.name,
  })

  return customer
}

export async function createCheckoutSession(user: {
  id: string
  email: string
  name: string
}) {
  try {
    const customer = await createStripeCustomer({
      name: user.name,
      email: user.email,
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      client_reference_id: user.id,
      customer: customer.id,
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
    const errorMessage = err instanceof Error ? err.message : 'Unknown Error'
    throw new Error(errorMessage)
  }
}

export async function handleProcessWebhookCheckout(event: {
  data: {
    object: Stripe.Checkout.Session
  }
}) {
  const eventObjectDataSchema = z.object({
    client_reference_id: z.string(),
    customer: z.string(),
    subscription: z.string(),
    status: z.enum(['open', 'complete', 'expired']),
  })

  const eventObject = eventObjectDataSchema.safeParse(event.data.object)

  if (eventObject.success === false) {
    throw new Error(
      '[WEBHOOK CHECKOUT] Session does not contain customer signature information.',
    )
  }

  if (eventObject.data.status !== 'complete') return

  const clientReferenceId = eventObject.data.client_reference_id
  const stripeCustomerId = eventObject.data.customer
  const stripeSubscriptionId = eventObject.data.subscription

  const userExists = await prisma.user.findUnique({
    select: { id: true },
    where: {
      id: clientReferenceId,
    },
  })

  if (!userExists) {
    throw new Error('Cliente reference ID not found.')
  }

  await prisma.user.update({
    data: {
      stripeCustomerId,
      stripeSubscriptionId,
    },
    where: {
      id: clientReferenceId,
    },
  })
}

export async function handleProcessWebhookUpdateSubscription(event: {
  data: {
    object: Stripe.Subscription
  }
}) {
  const eventObjectDataSchema = z.object({
    id: z.string(),
    customer: z.string(),
    status: z.enum([
      'active',
      'canceled',
      'incomplete',
      'incomplete_expired',
      'past_due',
      'paused',
      'trialing',
      'unpaid',
    ]),
  })

  const eventObject = eventObjectDataSchema.safeParse(event.data.object)

  if (eventObject.success === false) {
    throw new Error(
      '[WEBHOOK UPDATE] Session does not contain customer signature information.',
    )
  }

  const stripeCustomerId = eventObject.data.customer
  const stripeSubscriptionId = eventObject.data.id
  const stripeSubscriptionStatus = eventObject.data.status

  const userExists = await prisma.user.findFirst({
    select: { id: true },
    where: {
      stripeCustomerId,
    },
  })

  if (!userExists) {
    throw new Error('Cliente reference ID not found.')
  }

  await prisma.user.update({
    data: {
      stripeCustomerId,
      stripeSubscriptionId,
      stripeSubscriptionStatus,
    },
    where: {
      id: userExists.id,
    },
  })
}
