import Media from './models/media.model'
import { MediaPost } from './models/mediaPost.model'
import Post from './models/post.model'
import ApiUser from './models/apiUser.model'
import { apiUserService } from '../services/apiUser.service'

const dbInit = async () => {
  await Post.sync({ alter: true })
  await Media.sync({ alter: true })
  await MediaPost.sync({ alter: true })
  await ApiUser.sync({ alter: true })

  await createUser()
}

const createUser = async () => {
  const username = process.env.API_USER
  const password = process.env.API_PASSWORD

  if (username && password && !(await apiUserService.existsByUsername(username))) {
    await apiUserService.createUser(username, password)
  }
}

export default dbInit
