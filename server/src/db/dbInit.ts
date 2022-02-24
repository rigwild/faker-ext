import Media from './models/media.model'
import Post from './models/post.model'
import ApiUser from './models/apiUser.model'
import { apiUserService } from '../services/apiUser.service'
import { postRepository } from '../db/repositories/post.repository'

const dbInit = async () => {
  await Post.sync({ alter: true })
  await Media.sync({ alter: true })
  await ApiUser.sync({ alter: true })

  await createUser()
  await createHelloWorldPost()
}

const createUser = async () => {
  const username = process.env.API_USER
  const password = process.env.API_PASSWORD

  if (username && password && !(await apiUserService.existsByUsername(username))) {
    console.log(`Creating initial user "${username}"`)
    await apiUserService.createUser(username, password)
  }
}

const createHelloWorldPost = async () => {
  const id = '12345678-abcd-4abc-abcd-123456789abc'
  if (!(await postRepository.getById(id))) {
    console.log(`Creating hello world post`)
    await postRepository.create({ id, content: 'Hello world!' })
  }
}

export default dbInit
