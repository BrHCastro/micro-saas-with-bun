import type { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { createCheckoutSession } from '../../lib/stripe'

export async function checkoutController(request: Request, response: Response) {
  const requestHeaders = z.object({
    'x-user-id': z.string(),
  })

  const header = requestHeaders.safeParse(request.headers)

  if (header.success === false) {
    return response.status(403).json({ error: 'User ID not provided.' })
  }

  const user = await prisma.user.findUnique({
    select: {
      id: true,
    },
    where: {
      id: header.data['x-user-id'],
    },
  })

  if (!user) {
    return response.status(403).json({ error: 'Forbidden.' })
  }

  const checkout = await createCheckoutSession(user.id)

  return response.json(checkout)
}
