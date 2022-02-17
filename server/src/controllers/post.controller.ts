import express from 'express'
import { postService } from '../services/post.service'
import { asyncMiddleware } from '../utils/middleware.utils'
import { ApiError, ErrorTypeEnum } from '../errors/api.error'

const router = express.Router()

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
