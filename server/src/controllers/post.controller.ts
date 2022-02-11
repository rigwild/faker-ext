import * as express from 'express'
import { mediaService } from '../services/media.service'
import { postService } from '../services/post.service'
import { asyncMiddleware, authMiddleware, mediaMiddleware } from '../utils/middleware.utils'
import { ApiError, ErrorTypeEnum } from '../errors/api.error'

const router = express.Router()

router.post(
  '/upload',
  authMiddleware,
  mediaMiddleware.single('media'),
  asyncMiddleware(async (req, res) => {
    const contentType = req.headers['content-type']
    if (contentType === 'application/json') {
      const post = await postService.createPost(req.body)
      res.json({ externalUri: `/api/posts/${post.id}?postKey=${post.postKey}` })
      return
    } else if (req.headers['content-type']?.startsWith('multipart/form-data')) {
      if (req.file) {
        const media = await mediaService.createMedia(req.file)
        res.json({ externalUri: `/api/media/${media.id}?postKey=${media.postKey}` })
      }
      res.end()
      return
    }
    throw new ApiError(ErrorTypeEnum.invalidContentType, `The provided Content-Type "${contentType}" is not supported.`)
  })
)

router.get(
  '/:id',
  asyncMiddleware(async (req, res) => {
    if (!req.query.postKey) throw new ApiError(ErrorTypeEnum.missingPostKey)

    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) throw new ApiError(ErrorTypeEnum.invalidType, `The id parameter must be a number.`)

    const post = await postService.getPostById(id)

    const providedPostKey = req.query.postKey
    if (providedPostKey !== post.postKey) throw new ApiError(ErrorTypeEnum.invalidPostKey)

    res.json(post)
  })
)

export { router as postController }
