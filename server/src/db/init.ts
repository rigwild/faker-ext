import Post from "./models/post"

const dbInit = async () => {
    await Post.sync({ alter: true })
};

export default dbInit;