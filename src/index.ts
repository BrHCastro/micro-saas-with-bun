import express from 'express'

import { userRouter } from './http/routes/user'
import { todoRouter } from './http/routes/todo'
import { checkoutRouter } from './http/routes/checkout'
import { stripeRouter } from './http/routes/stripe'

const app = express()
const port = 3333

app.use(stripeRouter) // Stripe does not accept JSON

app.use(express.json())

app.use(userRouter)
app.use(todoRouter)
app.use(checkoutRouter)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
})
