import { FAKER_USER_AGENT } from '../config'
import { Post } from '../utils'

export abstract class FakerReplacer {
  public static fakerPostTag = 'Posted with Faker extension'

  constructor() {
    this.startRenderExternallyHostedPosts()
    console.log('[Faker][Extension] Extension initialized!')
  }

  /** Apply feed posts content transformation in the DOM */
  abstract renderExternallyHostedPosts(): Promise<void>

  /**
   * Retrieve external content from the self-hosted server
   * @param uri Content external uri
   * @returns Post content
   */
  protected async loadContentFromServer(uri: string): Promise<Post> {
    console.log(`[Faker][Extension] Loading content from uri ${uri}`)
    const res = await fetch(uri, {
      headers: {
        Accept: 'application/json',
        'User-Agent': FAKER_USER_AGENT
      }
    })
    const resJson = await res.json()
    if (!res.ok) throw new Error(resJson.message)

    const { content, timestamp } = resJson as Post
    return { content, timestamp }
  }

  private startRenderExternallyHostedPosts() {
    setInterval(async () => {
      await this.renderExternallyHostedPosts()
    }, 1000)
  }
}
