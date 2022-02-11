import ApiUser from '../db/models/apiUser.model'
import { apiUserRepository } from '../db/repositories/apiUser.repository'
import * as bcrypt from 'bcrypt';

export module apiUserService {
  export const getUserByUsername = async (username: string) => {
    const user = await apiUserRepository.getByUsername(username)
    if (user!=null) {
      delete(user.password);
    }
    return user;
  }

  export const existsByUsername = async (username: string): Promise<boolean> => {
    const user = await apiUserRepository.getByUsername(username)
    return !!user
  }

  export const validatePassword = async (username: string, password: string) => {
    const user = await apiUserRepository.getByUsername(username)
    if (!user) {
      return false;
    }

    return await bcrypt.compare(password, user.password!);
  }

  export const createUser = async (username: string, password: string) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser: Partial<ApiUser> = {
      username,
      password: hashedPassword
    }

    const savedUser = await apiUserRepository.create(newUser)

    console.log(`Created new user "${username}"`)

    return savedUser
  }
}
