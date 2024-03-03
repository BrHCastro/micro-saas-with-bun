import express from 'express'
import { checkoutController } from '../controllers/checkout.controller'

const router = express.Router()

router.post('/checkout', checkoutController)

export { router as checkoutRouter }
