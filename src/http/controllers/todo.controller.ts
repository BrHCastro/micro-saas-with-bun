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
    },
    where: {
      id: header.data['x-user-id'],
    },
  })

  if (!user) {
    return response.status(403).json({ error: 'Forbidden.' })
  }

  const body = requestBodyParams.safeParse(request.body)

  if (body.success === false) {
    return response.status(400).json({ error: 'Missing Required Data.' })
  }

  const { title, description } = body.data

  await prisma.todo.create({
    data: {
      userId: user.id,
      title,
      description,
    },
  })

  return response.status(201).send()
}
