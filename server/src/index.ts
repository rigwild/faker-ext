require('dotenv').config()

import path from 'path'
import express from 'express'
import cors from 'cors'
import dbInit from './db/dbInit'
import router from './controllers/index'
import { errorMiddleware } from './utils/middleware.utils'

const SERVER_PORT = process.env.SERVER_PORT ? +process.env.SERVER_PORT : 3000

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, '..', 'public')))

app.use(router)
app.use(errorMiddleware)

dbInit().then(() => {
  app.listen(SERVER_PORT, () => console.log(`Server is listening at http://localhost:${SERVER_PORT}`))
})
