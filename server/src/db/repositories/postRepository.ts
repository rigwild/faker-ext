import Post from "../models/post"

export const create = async (post: Partial<Post>) => {
    return await Post.create(post);
}

export const update = async (id: number, updatedPost: Partial<Post>) => {
    const orginalPost = await Post.findByPk(id);
    if (!orginalPost) {
        throw new Error("Not found");
    }

    return await orginalPost.update(updatedPost);
}

export const getById = async (id: number): Promise<Post | null> => {
    const post = await Post.findByPk(id);
    return post;
}

export const deleteById = async (id: number) => {
    const deletedPost = await Post.destroy({
        where: { id }
    })
    return !!deletedPost;
}

