import express from 'express'
import { ApiError, ErrorTypeEnum } from '../errors/api.error'
import { postService } from '../services/post.service'
import { asyncMiddleware } from '../utils/middleware.utils'
import { isUUIDv4 } from '../utils/utils'

const router = express.Router()

router.get(
  '/:id',
  asyncMiddleware(async (req, res) => {
    if (!isUUIDv4(req.params.id)) {
      throw new ApiError(ErrorTypeEnum.invalidType, `The id parameter must be a valid uuidv4.`)
    }
    const post = await postService.getPostById(req.params.id)
    res.json(post)
  })
)

export { router as postController }
