import * as express from 'express'
import { mediaService } from '../services/media.service'
import { asyncMiddleware } from '../utils/middleware.utils'
import { ApiError, ErrorTypeEnum } from '../errors/api.error'

const router = express.Router()

router.get(
  '/:id',
  asyncMiddleware(async (req, res) => {
    if (!req.query.postKey) throw new ApiError(ErrorTypeEnum.missingPostKey)

    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      throw new ApiError(ErrorTypeEnum.invalidType, `The id parameter must be a number.`)
    }
    const media = await mediaService.getMediaById(id)

    const providedPostKey = req.query.postKey
    if (providedPostKey !== media.postKey) throw new ApiError(ErrorTypeEnum.invalidPostKey)

    res.setHeader('Content-Type', media.mimeType)
    res.send(media.media)
  })
)

export { router as mediaController }
