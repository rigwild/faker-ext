require('dotenv').config();

import path from 'path'
import express from 'express'
import cors from 'cors'
import * as postRepository from './db/repositories/postRepository';
import dbInit from './db/init';



const SERVER_PORT = process.env.SERVER_PORT ? +process.env.SERVER_PORT : 3000

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, '..', 'public')))

const asyncMiddleware =
  (fn: express.RequestHandler) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }

app.post(
  '/api/upload',
  asyncMiddleware(async (req, res) => {
    if (req.headers['content-type'] === 'application/json') {
      const newPost = req.body
      const savedPost = await postRepository.create(newPost);
      const id = savedPost.id;
      console.log(savedPost);

      const content = savedPost.content;
      // const summary = content.length > 50 ? `${content.slice(0, 50)}...` : content
      // console.log(`New post "${summary}" saved at ${id}`)

      res.json({ externalUri: `/${id}` })
      return
    }
    res.status(501).send({ message: 'The provided Content-Type is not supported' })
  })
)

app.get('/:id', async(req, res) => {
  const id = Number(req.params.id);
  const post = await postRepository.getById(id);

  if (!post) {
    res.status(404).json({ message: 'Content was not found' })
    return
  }

  res.json(post)
})

dbInit().then(() => {
  app.listen(SERVER_PORT, () => console.log(`Server is listening at http://localhost:${SERVER_PORT}`))
})


