import { FAKER_CONFIG } from './config'

export type Post = { content: string; timestamp: Date }

export const delay = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms))

export abstract class FakerReplacer {
  public static fakerPostTag = 'Posted with Faker extension ✨'

  /** Lock to not re-register the click event handler if the post is currently being replaced */
  private isPostingLock = false

  /** AddEventListener loop interval identifier */
  private intervalId?: number
  private publishButtonEventHandlerBindedFn: typeof FakerReplacer['prototype']['publishButtonEventHandler']

  /** publishButtonEventHandler unique reference */

  constructor(public minWaitTimeMs = 500) {
    console.log('[Faker] Extension initialized!')
  }

  /** Get the DOM element that triggers the post publishing */
  abstract getPublishButton(): HTMLButtonElement

  /** Apply the post content transformation in the DOM before publishing it */
  abstract transformPost(): Promise<void>

  /** Apply feed posts content transformation in the DOM */
  abstract renderTransformedPosts(): Promise<void>

  /**
   * Upload the content to the self-hosted server and get its URI
   * @param content Post content
   * @returns Link to the self-hosted content
   */
  protected async getContentExternalUri(content: string) {
    const summary = content.length > 50 ? `${content.slice(0, 50)}...` : content
    console.log(`[Faker] Getting external link for post "${summary}"...`)

    const res = await fetch(`${FAKER_CONFIG.serverUri}/api/upload`, {
      method: 'POST',
      body: JSON.stringify({ content }),
      headers: {
        'User-Agent': 'faker-ext v0.1',
        'Content-Type': 'application/json'
      }
    })
    const resJson = await res.json()
    if (!res.ok) throw new Error(resJson.message)

    const { externalUri } = resJson
    const fullExternalUri = `${FAKER_CONFIG.serverUri}${externalUri}`
    console.log(`[Faker] Replacing post with external link ${fullExternalUri}`)
    return fullExternalUri
  }

  /**
   * Get content from the self-hosted server
   * @param uri Content uri
   * @returns Post content
   */
  protected async getExternalContent(uri: string): Promise<Post> {
    console.log(`[Faker] Getting external content for uri "${uri}"...`)

    const res = await fetch(uri, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'faker-ext v0.1'
      }
    })
    const resJson = await res.json()
    if (!res.ok) throw new Error(resJson.message)

    const { content, timestamp } = resJson as Post
    const summary = content.length > 50 ? `${content.slice(0, 50)}...` : content

    console.log(`[Faker] Replacing post with content "${summary}"`)
    return { content, timestamp }
  }

  public async publishButtonEventHandler(e: Event) {
    try {
      this.isPostingLock = true

      // Prevent subsequent click event listeners from being triggered
      e.stopImmediatePropagation()

      console.log('[Faker] Editing post content')
      await this.transformPost()

      // Minimum time to wait after replace (if the post content replace is done too soon before
      // posting, the replace will not be taken into account!)
      await delay(this.minWaitTimeMs)

      console.log('[Faker] Publishing replaced post')
      this.getPublishButton().click()
    } catch (error: any) {
      error.message = `[Faker] Failed to replace post content - ${error.message}`
      throw error
    } finally {
      this.isPostingLock = false
    }
  }

  /**
   * Always get the same `publishButtonEventHandler` function reference, correctly binded to the class
   * @returns `publishButtonEventHandler` correctly binded to the class
   */
  protected publishButtonEventHandlerBinded() {
    if (!this.publishButtonEventHandlerBindedFn)
      this.publishButtonEventHandlerBindedFn = this.publishButtonEventHandler.bind(this)
    return this.publishButtonEventHandlerBindedFn
  }

  public publishButtonAddEventListener = () => {
    this.getPublishButton().addEventListener('click', this.publishButtonEventHandlerBinded(), {
      capture: true,
      once: true
    })
  }

  public start() {
    this.intervalId = setInterval(async () => {
      // Hook the post publish button
      if (!this.isPostingLock && this.getPublishButton()) this.publishButtonAddEventListener()

      // Replace the posts with their externally-hosted content
      await this.renderTransformedPosts()
    }, 1000)
  }

  public stop() {
    if (typeof this.intervalId === 'number') {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

export const isValidHttpUrl = (str: string) => {
  let url: URL
  try {
    url = new URL(str)
  } catch {
    return false
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
}
