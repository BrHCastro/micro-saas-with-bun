import express from 'express'
import { createTodoController } from '../controllers/todo.controller'

const router = express.Router()

router.post('/todos', createTodoController)

export { router as todoRouter }
