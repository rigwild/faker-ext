import Media from '../models/media.model'

export namespace mediaRepository {
  export const create = async (media: Partial<Media>) => {
    return await Media.create(media)
  }

  export const getById = async (id: number): Promise<Media | null> => {
    const media = await Media.findByPk(id)
    return media?.get({ plain: true })
  }

  export const deleteById = async (id: number) => {
    const deletedMedia = await Media.destroy({ where: { id } })
    return !!deletedMedia
  }
}
