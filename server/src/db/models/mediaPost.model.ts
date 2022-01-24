import { sequelize } from "../dbConfig";
import Media from "./media.model";
import Post from "./post.model";

export const MediaPost = sequelize.define("media_posts", {});

Media.belongsToMany(Post, { through: MediaPost, as: "posts", foreignKey: "media_id"});
Post.belongsToMany(Media, { through: MediaPost, as: "medias", foreignKey: "post_id"});