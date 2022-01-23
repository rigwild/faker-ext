import * as express from 'express';
import { ApiError, ErrorTypeEnum } from '../errors/api.error';
import { mediaService } from '../services/media.service';
import { postService } from '../services/post.service';
import { asyncMiddleware, mediaMiddleware } from '../utils/middleware.utils';

const router = express.Router()

router.post(
    '/upload',
    mediaMiddleware.single('media'),
    asyncMiddleware(async (req, res) => {
        const contentType = req.headers['content-type'];
        if (contentType === 'application/json') {
            const post = await postService.createPost(req.body);
            res.json({ externalUri: `/api/posts/${post.id}` })
            return
        } else if (req.headers['content-type']?.startsWith('multipart/form-data')) {
            if (req.file) {
                const media = await mediaService.createMedia(req.file);
                res.json({ externalUri: `/media/${media.id}` })
            }
            res.end()
            return
        }
        throw new ApiError(ErrorTypeEnum.invalidContentType, `The provided Content-Type '${contentType}' is not supported.`);
    })
)

router.get('/:id', asyncMiddleware(async (req, res) => {
    const id = Number(req.params.id);
    const post = await postService.getPostById(id)
    res.json(post)
}))

export { router as postController } 