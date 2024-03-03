import express from 'express'
import { createTodoController } from '../controllers/todo.controller'

const router = express.Router()

router.post('/todo', createTodoController)

export { router as todoRouter }
