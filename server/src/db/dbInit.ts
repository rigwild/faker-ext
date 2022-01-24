import Media from "./models/media.model";
import { MediaPost } from "./models/mediaPost.model";
import Post from "./models/post.model";

const dbInit = async () => {    
    await Post.sync({alter: true});
    await Media.sync({alter: true});
    await MediaPost.sync({alter: true});
};

export default dbInit;