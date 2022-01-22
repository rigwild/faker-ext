import Post from "./models/post.model"
import Media from "./models/media.model";



Media.belongsToMany(Post, { through: "MediaPosts", as: "posts"});
Post.belongsToMany(Media, { through: "MediaPosts", as: "medias"});

const dbInit = async () => {    
    await Post.sync({ alter: true });
    await Media.sync({ alter: true });
};

export default dbInit;