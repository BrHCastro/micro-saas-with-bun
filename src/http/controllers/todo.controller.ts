import type { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'

export async function createTodoController(
  request: Request,
  response: Response,
) {
  const requestBodyParams = z.object({
    title: z.string(),
    description: z.string().optional(),
  })

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
      stripeSubscriptionId: true,
      stripeSubscriptionStatus: true,
      _count: {
        select: {
          todos: true,
        },
      },
    },
    where: {
      id: header.data['x-user-id'],
    },
  })

  if (!user) {
    return response.status(403).json({ error: 'Forbidden.' })
  }

  const hasCotaAvailable =
    user.stripeSubscriptionStatus !== 'active' && user._count.todos < 5

  const hasActiveSubscription =
    user.stripeSubscriptionId && user.stripeSubscriptionStatus === 'active'

  if (!hasCotaAvailable && !hasActiveSubscription) {
    return response.status(403).json({ error: 'No quota available.' })
  }

  const body = requestBodyParams.safeParse(request.body)

  if (body.success === false) {
    return response.status(400).json({ error: 'Missing Required Data.' })
  }

  const { title, description } = body.data

  const newUser = await prisma.todo.create({
    data: {
      userId: user.id,
      title,
      description,
    },
    select: {
      title: true,
    },
  })

  return response.status(201).json(newUser)
}
