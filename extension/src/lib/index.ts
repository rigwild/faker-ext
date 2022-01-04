import { delay, isValidHttpUrl } from './utils'
import { FAKER_CONFIG } from '../config'
import { scriptToInject } from './hooks'

export { delay, isValidHttpUrl }

const fakerUserAgent = 'faker-ext v0.1'

export type Post = { content: string; timestamp: Date }
export type HookConfig = { method: string; uri: string; bodyContentObjectPath: string }

/**
 * Upload the content to the self-hosted server and get its URI
 * @param content Post content
 * @returns Link to the self-hosted content
 */
const getContentExternalUri = async (content: string) => {
  const summary = content.length > 50 ? `${content.slice(0, 50)}...` : content
  console.log(`[Faker][Extension] Getting external link for post "${summary}"...`)

  const res = await fetch(`${FAKER_CONFIG.serverUri}/api/upload`, {
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
  console.log(`[Faker][Extension] Here is the external link ${fullExternalUri}`)
  return fullExternalUri
}

/**
 * Retrieve external content from the self-hosted server
 * @param uri Content external uri
 * @returns Post content
 */
const getExternalContentFromUri = async (uri: string): Promise<Post> => {
  console.log(`[Faker][Extension] Retrieve external content from uri ${uri}`)
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

export abstract class FakerReplacer {
  public static fakerPostTag = 'Posted with Faker extension ✨'

  constructor(private readonly hookConfig: HookConfig) {
    this.startMessageListener()
    this.startRenderExternallyHostedPosts()
    this.startRequestHooks()
    console.log('[Faker][Extension] Extension initialized!')
  }

  /** Apply feed posts content transformation in the DOM */
  abstract renderExternallyHostedPosts(): Promise<void>

  protected getContentExternalUri = getContentExternalUri
  protected getExternalContentFromUri = getExternalContentFromUri

  private startMessageListener() {
    window.addEventListener('message', async event => {
      if (event.data.from === 'PAGE' && event.data.type === 'UPLOAD_TO_FAKER' && event.data.postContent) {
        const externalUri = await this.getContentExternalUri(event.data.postContent)
        // Add the Faker tag at the end
        const postContent = `${externalUri}\n\n${FakerReplacer.fakerPostTag}`
        window.postMessage({ from: 'EXTENSION', type: 'UPLOAD_TO_FAKER_RESULT', postContent })
      }
    })
  }

  private startRenderExternallyHostedPosts() {
    setInterval(async () => {
      await this.renderExternallyHostedPosts()
    }, 1000)
  }

  /**
   * Inject scripts necessary to hook the requests (by appending it in a `<script>` tag in the page)
   */
  private startRequestHooks() {
    // We inject this in the page using a `<script>` tag because the extension's content script and the page
    // do not share the same context and we need to hook `window.fetch` and `window.XMLHttpRequest`
    // from the page's context
    // (e.g. `window` from extension is different from `window` of page)
    // Note: This function will not have access to other variables so we pass them as parameters
    console.log('[Faker][Extension] Injecting necessary scripts into a `<script>` tag')
    const script = document.createElement('script')
    script.text = scriptToInject(this.hookConfig)
    document.documentElement.appendChild(script)
  }
}
