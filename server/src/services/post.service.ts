import Post from '../db/models/post.model'
import { mediaPostRepository } from '../db/repositories/mediaPost.repository'
import { postRepository } from '../db/repositories/post.repository'
import { ApiError, ErrorTypeEnum } from '../errors/api.error'

export module postService {
  export const getPostById = async (id: number) => {
    const post = await postRepository.getById(id)

    if (!post) throw new ApiError(ErrorTypeEnum.invalidElementId, `No post with ID '${id}'`)

    return post
  }

  export const createPost = async (newPost: Partial<Post>) => {
    const savedPost = await postRepository.create(newPost)

    if (newPost.mediaIds) {
      let promises: Promise<any>[] = newPost.mediaIds.map(mediaId => mediaPostRepository.create(savedPost.id, mediaId))
      await Promise.all(promises)
    }

    const content = savedPost.content
    const summary = content.length > 50 ? `${content.slice(0, 50)}...` : content
    console.log(`New post "${summary}" saved at ${savedPost.id}`)

    return savedPost
  }
}
