import express from 'express'

import { userRouter } from './http/routes/user'
import { todoRouter } from './http/routes/todo'

const app = express()
const port = 3333

app.use(express.json())
app.use(userRouter)
app.use(todoRouter)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
})
