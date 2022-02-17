import Media, { MimeType } from '../db/models/media.model'
import { mediaRepository } from '../db/repositories/media.repository'
import { ApiError, ErrorTypeEnum } from '../errors/api.error'

export module mediaService {
  export const createMedia = async (file: Express.Multer.File) => {
    const media: Partial<Media> = {
      media: file.buffer,
      mimeType: file.mimetype as MimeType
    }
    const savedMedia = await mediaRepository.create(media)
    return savedMedia
  }

  export const getMediaById = async (id: string) => {
    const media = await mediaRepository.getById(id)

    if (!media) throw new ApiError(ErrorTypeEnum.invalidElementId, `No media with ID "${id}"`)

    return media
  }
}
