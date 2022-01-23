import Media, { MimType } from "../db/models/media.model";
import { mediaRepository } from "../db/repositories/media.repository";

export module mediaService {

    export const createMedia = async (file: Express.Multer.File) => {
        const media: Partial<Media> = {
            media: file.buffer,
            mimType: file.mimetype as MimType
        }

        const savedMedia = await mediaRepository.create(media);

        return savedMedia;
    }
}