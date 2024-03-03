import { env } from './env'

export const config = {
  stripe: {
    PublishableKey: env.STRIPE_PUBLIC_KEY,
    secretKey: env.STRIPE_SECRET_KEY,
    proPriceId: env.STRIPE_PRO_PRICE_ID,
    webHookSecret: env.STRIPE_WEBHOOK_SECRET,
  },
}
