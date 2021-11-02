import Post from "./models/post.model"

const dbInit = async () => {
    await Post.sync({ alter: true })
};

export default dbInit;