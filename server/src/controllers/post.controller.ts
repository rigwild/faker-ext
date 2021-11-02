import * as express from 'express';
import { postRepository } from '../db/repositories/post.repository';
import { ApiError, ErrorTypeEnum } from '../errors/api.error';
import { postService } from '../services/post.service';
import { asyncMiddleware } from '../utils/middleware.utils';

const router = express.Router()

router.post(
    '/upload',
    asyncMiddleware(async (req, res) => {
        const contentType = req.headers['content-type'];
        if (contentType === 'application/json') {
            const post = await postService.createPost(req.body);
            res.json({ externalUri: `/api/posts/${post.id}` })
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