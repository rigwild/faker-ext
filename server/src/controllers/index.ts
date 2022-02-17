import express from 'express'
import { postController } from './post.controller'
import { mediaController } from './media.controller'
import { mediaService } from '../services/media.service'
import { postService } from '../services/post.service'
import { asyncMiddleware, authMiddleware, mediaMiddleware } from '../utils/middleware.utils'
import { ApiError, ErrorTypeEnum } from '../errors/api.error'

const api = express.Router()

api.use('/posts', postController)
api.use('/media', mediaController)

api.post('/config-check', authMiddleware, (req, res) => res.end())

api.post(
  '/upload',
  authMiddleware,
  mediaMiddleware.single('media'),
  asyncMiddleware(async (req, res) => {
    const contentType = req.headers['content-type']
    if (contentType === 'application/json') {
      const post = await postService.createPost(req.body)
      res.json({ externalUri: `/faker/api/posts/${post.id}?postKey=${post.postKey}` })
      return
    } else if (req.headers['content-type']?.startsWith('multipart/form-data')) {
      if (req.file) {
        const media = await mediaService.createMedia(req.file)
        res.json({ externalUri: `/faker/api/media/${media.id}?postKey=${media.postKey}` })
      }
      res.end()
      return
    }
    throw new ApiError(ErrorTypeEnum.invalidContentType, `The provided Content-Type "${contentType}" is not supported.`)
  })
)

const router = express.Router()
router.use('/faker/api', api)

export default router
