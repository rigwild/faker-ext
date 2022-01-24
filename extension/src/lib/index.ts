import { delay, isValidHttpUrl } from './utils'
import { FAKER_CONFIG } from '../config'
import { scriptToInject } from './hooks'

export { delay, isValidHttpUrl }

const fakerUserAgent = 'faker-ext v0.1'

export type Post = { content: string; timestamp: Date }
export type HookConfig = {
  textReplace: {
    method: string
    uri: string
    bodyContentObjectPath: string
  }
  imageReplace: {
    method: string
    uri: string
  }
}

export abstract class FakerReplacer {
  public static fakerPostTag = 'Posted with Faker extension'

  constructor(private readonly hookConfig: HookConfig) {
    this.startMessageListener()
    this.startRenderExternallyHostedPosts()
    this.startRequestHooks()
    console.log('[Faker][Extension] Extension initialized!')
  }

  /** Apply feed posts content transformation in the DOM */
  abstract renderExternallyHostedPosts(): Promise<void>

  /**
   * Upload the text post to the self-hosted server and get its URI
   * @param content Post content
   * @returns Link to the self-hosted content
   */
  protected async uploadTextPostToServer(content: string): Promise<string> {
    const summary = content.length > 50 ? `${content.slice(0, 50)}...` : content
    console.log(`[Faker][Extension] Uploading the post "${summary}"...`)

    const res = await fetch(`${FAKER_CONFIG.serverUri}/api/posts/upload`, {
      method: 'POST',
      body: JSON.stringify({ content }),
      headers: {
        'User-Agent': fakerUserAgent,
        'Content-Type': 'application/json'
      }
    })
    const resJson = await res.json()
    if (!res.ok) throw new Error(resJson.message)

    const { externalUri } = resJson
    const fullExternalUri = `${FAKER_CONFIG.serverUri}${externalUri}`
    console.log(`[Faker][Extension] External link generated by the server for text post: ${fullExternalUri}`)
    return fullExternalUri
  }

  /**
   * Upload the media to the self-hosted server and get its URI
   * @param media Uploaded media
   * @returns Link to the self-hosted content
   */
  protected async uploadMediaToServer(media: File): Promise<string> {
    console.log(`[Faker][Extension] Uploading the media "${media.name}" with type "${media.type}"...`)

    const formData = new FormData()
    formData.append('media', media, media.name)

    const res = await fetch(`${FAKER_CONFIG.serverUri}/api/posts/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': fakerUserAgent
      }
    })
    const resJson = await res.json()
    if (!res.ok) throw new Error(resJson.message)

    const { externalUri } = resJson
    const fullExternalUri = `${FAKER_CONFIG.serverUri}${externalUri}`
    console.log(`[Faker][Extension] External link generated by the server for media: ${fullExternalUri}`)
    return fullExternalUri
  }

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
        'User-Agent': fakerUserAgent
      }
    })
    const resJson = await res.json()
    if (!res.ok) throw new Error(resJson.message)

    const { content, timestamp } = resJson as Post
    return { content, timestamp }
  }

  /**
   * Listen for incoming messages from the page asking to upload some content to a Faker server
   * from the context of extension (no CSP in extension context! 😋)
   */
  private startMessageListener() {
    // Listen to text post upload request
    window.addEventListener('message', async event => {
      if (event.data.from === 'PAGE' && event.data.type === 'UPLOAD_TO_FAKER_TEXT' && event.data.postContent) {
        const externalUri = await this.uploadTextPostToServer(event.data.postContent as string)
        // Add the Faker tag at the end
        const postContent = `${externalUri}\n\n${FakerReplacer.fakerPostTag}`
        window.postMessage({ from: 'EXTENSION', type: 'UPLOAD_TO_FAKER_TEXT_RESULT', postContent })
      }
    })

    // Listen to media upload request
    window.addEventListener('message', async event => {
      if (event.data.from === 'PAGE' && event.data.type === 'UPLOAD_TO_FAKER_MEDIA' && event.data.media) {
        const externalUri = await this.uploadMediaToServer(event.data.media as File)
        // Add the Faker tag at the end
        const media = `${externalUri}\n\n${FakerReplacer.fakerPostTag}`
        window.postMessage({ from: 'EXTENSION', type: 'UPLOAD_TO_FAKER_MEDIA_RESULT', media })
      }
    })
  }

  private startRenderExternallyHostedPosts() {
    setInterval(async () => {
      await this.renderExternallyHostedPosts()
    }, 1000)
  }

  /**
   * Inject necessary scripts to hook the requests (by inserting it in a `<script>` tag in the page)
   */
  private startRequestHooks() {
    // We inject this in the page using a `<script>` tag because the extension's content script and the page
    // do not share the same context and we need to hook `window.fetch` and `window.XMLHttpRequest`
    // from the page's context
    // (e.g. `window` from extension is different from `window` of page)
    console.log('[Faker][Extension] Injecting necessary scripts into a `<script>` tag')
    const script = document.createElement('script')
    script.text = scriptToInject(this.hookConfig)
    document.documentElement.appendChild(script)
  }
}
