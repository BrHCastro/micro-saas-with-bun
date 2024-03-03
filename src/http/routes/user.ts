import express from 'express'
import {
  createUserController,
  findUserByIdController,
  listUserController,
} from '../controllers/user.controller'

const router = express.Router()

router.get('/users', listUserController)

router.get('/users/:userId', findUserByIdController)

router.post('/users', createUserController)

export { router as userRouter }
