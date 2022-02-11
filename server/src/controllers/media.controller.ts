import * as express from 'express'
import { mediaService } from '../services/media.service'
import { asyncMiddleware } from '../utils/middleware.utils'
import { ApiError, ErrorTypeEnum } from '../errors/api.error'

const router = express.Router()

router.get(
  '/:id',
  asyncMiddleware(async (req, res) => {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      throw new ApiError(ErrorTypeEnum.invalidType, `The id parameter must be a number.`)
    }
    const media = await mediaService.getMediaById(id)
    res.writeHead(200, {
      'Content-Type': media.mimType,
      'Content-Length': media.media.length
    })
    res.end(media.media)
  })
)

export { router as mediaController }
