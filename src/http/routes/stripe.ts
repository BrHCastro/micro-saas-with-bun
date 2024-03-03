import express from 'express'
import { stripeWebhookController } from '../controllers/stripe-webhook.controller'

const router = express.Router()

router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhookController,
)

export { router as stripeRouter }
