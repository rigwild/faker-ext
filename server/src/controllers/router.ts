import express from 'express'
import { postController } from './post.controller'
import { mediaController } from './media.controller'

const api = express.Router()

api.use('/posts', postController)
api.use('/media', mediaController)

const router = express.Router()
router.use('/api', api)

export default router
