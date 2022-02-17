import Media from './models/media.model'
import Post from './models/post.model'
import ApiUser from './models/apiUser.model'
import { apiUserService } from '../services/apiUser.service'
import { postService } from '../services/post.service'

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
  if (!(await postService.getPostById(id))) {
    console.log(`Creating hello world post`)
    await postService.createPost({ id, content: 'Hello world!' })
  }
}

export default dbInit
