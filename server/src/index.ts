import path from 'path'
import express from 'express'
import cors from 'cors'
import { nanoid } from 'nanoid'

const SERVER_PORT = process.env.SERVER_PORT ? +process.env.SERVER_PORT : 3000

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, '..', 'public')))

type Post = { content: string; timestamp: Date }
const db = new Map<string, Post>()
db.set('hello-world', { content: 'Hello world!', timestamp: new Date() })

const asyncMiddleware =
  (fn: express.RequestHandler) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }

app.post(
  '/api/upload',
  asyncMiddleware((req, res) => {
    const id = nanoid()
    if (req.headers['content-type'] === 'application/json') {
      const { content } = req.body
      db.set(id, { content, timestamp: new Date() })

      const summary = content.length > 50 ? `${content.slice(0, 50)}...` : content
      console.log(`New post "${summary}" saved at ${id}`)

      res.json({ externalUri: `/${id}` })
      return
    }
    res.status(501).send({ message: 'The provided Content-Type is not supported' })
  })
)

app.get('/:id', (req, res) => {
  const { id } = req.params
  if (!db.has(id)) {
    res.status(404).json({ message: 'Content was not found' })
    return
  }
  res.json(db.get(id))
})

app.listen(SERVER_PORT, () => console.log(`Server is listening at http://localhost:${SERVER_PORT}`))
