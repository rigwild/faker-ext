import ApiUser from '../models/apiUser.model'
import Media from '../models/media.model'

export namespace apiUserRepository {
  export const create = async (user: Partial<ApiUser>) => {
    return await ApiUser.create(user)
  }

  export const update = async (id: number, updatedUser: Partial<ApiUser>) => {
    const orginalUser = await ApiUser.findByPk(id)
    if (!orginalUser) {
      throw new Error('Not found')
    }

    return await orginalUser.update(updatedUser)
  }

  export const getById = async (id: number): Promise<ApiUser | null> => {
    const user = await ApiUser.findByPk(id)
    return user
  }

  export const deleteById = async (id: number) => {
    const deletedUser = await ApiUser.destroy({ where: { id } })
    return !!deletedUser
  }

  export const getByUsername = async (username: string): Promise<ApiUser | null> => {
    const user = await ApiUser.findOne({ 
      where: { username } 
    });
    return user
  }

  export const deleteByUsername = async (username: string) => {
    const deletedUser = await ApiUser.destroy({ 
      where: { username } 
    });
    return !!deletedUser
  }
}
