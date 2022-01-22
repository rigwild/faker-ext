import Media from "../models/media.model"

export namespace mediaRepository {
    
    export const create = async (post: Partial<Media>) => {
        return await Media.create(post);
    }
    
    export const getById = async (id: number): Promise<Media | null> => {
        const media = await Media.findByPk(id);
        
        return media;
    }

    // <TODO>
    // export const getByPostId  = async (id: number): Promise<Media | null> => {
    //     return null;
    // }
    
    export const deleteById = async (id: number) => {
        const deletedMedia = await Media.destroy({
            where: { id }
        })
        return !!deletedMedia;
    }
    
}
