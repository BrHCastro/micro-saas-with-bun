import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function listUserController(request: Request, response: Response) {
  const users = await prisma.user.findMany()

  return response.json(users)
}

export async function findUserByIdController(
  request: Request,
  response: Response,
) {
  const requestQueryParams = z.object({
    userId: z.string().uuid(),
  })

  const { userId } = requestQueryParams.parse(request.params)

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!user) {
    return response.status(404).json({ error: 'User not found.' })
  }

  return response.json(user)
}

export async function createUserController(
  request: Request,
  response: Response,
) {
  const requestBodyParams = z.object({
    name: z.string(),
    email: z.string().email(),
  })

  const body = requestBodyParams.safeParse(request.body)

  if (body.success === false) {
    return response.status(400).json({ error: 'Missing Required Data.' })
  }

  const { name, email } = body.data

  const userAlreadyExists = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  })

  if (userAlreadyExists) {
    return response.status(409).json({ error: 'Email already taken.' })
  }

  await prisma.user.create({
    data: {
      email,
      name,
    },
  })

  return response.status(201).send()
}
