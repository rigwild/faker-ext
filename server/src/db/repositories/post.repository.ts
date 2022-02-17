import Post from '../models/post.model'

export namespace postRepository {
  export const create = (post: Partial<Post>) => {
    return Post.create(post)
  }

  export const update = async (id: string, updatedPost: Partial<Post>) => {
    const orginalPost = await Post.findByPk(id)
    if (!orginalPost) {
      throw new Error('Not found')
    }
    return orginalPost.update(updatedPost)
  }

  export const getById = (id: string): Promise<Post | null> => {
    return Post.findByPk(id)
  }

  export const deleteById = async (id: string) => {
    const deletedPost = await Post.destroy({ where: { id } })
    return !!deletedPost
  }
}
