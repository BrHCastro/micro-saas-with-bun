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

  const body = requestBodyParams.safeParse(request.body)

  if (body.success === false) {
    return response.status(400).json({ error: 'Missing Required Data.' })
  }

  const { title, description } = body.data

  await prisma.todo.create({
    data: {
      title,
      description,
    },
  })

  return response.status(201).send()
}
