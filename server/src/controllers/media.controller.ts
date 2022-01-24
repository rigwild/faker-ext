import * as express from 'express';
import { mediaService } from '../services/media.service';
import { asyncMiddleware } from '../utils/middleware.utils';

const router = express.Router()

router.get('/:id', asyncMiddleware(async (req, res) => {
    const id = Number(req.params.id);
    const media = await mediaService.getMediaById(id);

    res.writeHead(200, {
        'Content-Type': media.mimType,
        'Content-Length': media.media.length
    });
    res.end(media.media);
}))

export { router as mediaController };
