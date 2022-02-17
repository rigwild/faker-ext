import ApiUser from '../db/models/apiUser.model'
import { apiUserRepository } from '../db/repositories/apiUser.repository'
import bcrypt from 'bcrypt'

export module apiUserService {
  export const getUserByUsername = async (username: string) => {
    const user = await apiUserRepository.getByUsername(username)
    if (user) delete user.password
    return user
  }

  export const existsByUsername = async (username: string): Promise<boolean> => {
    const user = await apiUserRepository.getByUsername(username)
    return !!user
  }

  export const validatePassword = async (username: string, password: string) => {
    const user = await apiUserRepository.getByUsername(username)
    return user ? bcrypt.compare(password, user.password!) : false
  }

  export const createUser = async (username: string, password: string) => {
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser: Partial<ApiUser> = {
      username,
      password: hashedPassword
    }
    const savedUser = await apiUserRepository.create(newUser)

    console.log(`Created new user "${username}"`)
    return savedUser
  }
}
