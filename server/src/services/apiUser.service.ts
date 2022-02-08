import ApiUser from '../db/models/apiUser.model'
import { apiUserRepository } from '../db/repositories/apiUser.repository'
import * as bcrypt from 'bcrypt';

export module apiUserService {
  export const getUserByName = async (name: string) => {
    const user = await apiUserRepository.getByName(name)
    if (user!=null) {
      delete(user.password);
    }
    return user;
  }

  export const existsByName = async (name: string): Promise<boolean> => {
    const user = await apiUserRepository.getByName(name)
    return !!user
  }

  export const validatePassword = async (name: string, password: string) => {
    const user = await apiUserRepository.getByName(name)
    if (!user) {
      return false;
    }

    return await bcrypt.compare(password, user.password!);
  }

  export const createUser = async (name: string, password: string) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser: Partial<ApiUser> = {
      name,
      password: hashedPassword
    }

    const savedUser = await apiUserRepository.create(newUser)

    console.log(`New user "${name}"`)

    return savedUser
  }
}
