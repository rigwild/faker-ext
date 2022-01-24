import { MediaPost } from "../models/mediaPost.model";

export namespace mediaPostRepository {
    
    export const create = async (postId: number, mediaId: number) => {
        let mediaPost = MediaPost.build({media_id: mediaId, post_id: postId});
        console.log({mediaPost});
        return await mediaPost.save();
    }    
}
