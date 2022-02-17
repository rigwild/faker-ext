import Media from './models/media.model'
import Post from './models/post.model'
import ApiUser from './models/apiUser.model'
import { apiUserService } from '../services/apiUser.service'

const dbInit = async () => {
  await Post.sync({ alter: true })
  await Media.sync({ alter: true })
  await ApiUser.sync({ alter: true })

  // Create an initial user
  await createUser()
}

const createUser = async () => {
  const username = process.env.API_USER
  const password = process.env.API_PASSWORD

  if (username && password && !(await apiUserService.existsByUsername(username))) {
    console.log(`Creating initial user "${username}"`)
    await apiUserService.createUser(username, password)
  }
}

export default dbInit
