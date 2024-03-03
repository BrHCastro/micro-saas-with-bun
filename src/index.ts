import express from 'express'
import {
  createUserController,
  findUserByIdController,
  listUserController,
} from './controllers/user.controller'

const app = express()
const port = 3333

app.use(express.json())

app.get('/users', listUserController)

app.get('/users/:userId', findUserByIdController)

app.post('/users', createUserController)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
})
