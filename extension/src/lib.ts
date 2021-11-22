import { FAKER_CONFIG } from './config'

export type Post = { content: string; timestamp: Date }
export type HookConfig = { method: string; uri: string; bodyContentObjectPath: string }

export const delay = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms))

export const isValidHttpUrl = (str: string) => {
  let url: URL
  try {
    url = new URL(str)
  } catch {
    return false
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
}

/** @see https://stackoverflow.com/a/43849204 */
export const objectPathGet = (object: any, path: string, defaultValue: any) =>
  path.split('.').reduce((o, p) => (o ? o[p] : defaultValue), object)

/** @see https://stackoverflow.com/a/43849204 */
export const objectPathSet = (object: any, path: string, value: any) =>
  path.split('.').reduce((o, p, i) => (o[p] = path.split('.').length === ++i ? value : o[p] || {}), object)

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

  /**
   * Upload the content to the self-hosted server and get its URI
   * @param content Post content
   * @returns Link to the self-hosted content
   */
  protected async getContentExternalUri(content: string) {
    const summary = content.length > 50 ? `${content.slice(0, 50)}...` : content
    console.log(`[Faker][Extension] Getting external link for post "${summary}"...`)

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
    console.log(`[Faker][Extension] Here is the external link ${fullExternalUri}`)
    return fullExternalUri
  }

  /**
   * Retrieve external content from the self-hosted server
   * @param uri Content external uri
   * @returns Post content
   */
  protected async getExternalContentFromUri(uri: string): Promise<Post> {
    console.log(`[Faker][Extension] Retrieve external content from uri ${uri}`)
    const res = await fetch(uri, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'faker-ext v0.1'
      }
    })
    const resJson = await res.json()
    if (!res.ok) throw new Error(resJson.message)

    const { content, timestamp } = resJson as Post
    return { content, timestamp }
  }

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
    // console.log('hook me bro', window.fetch, window.XMLHttpRequest)
    // TODO: Hook fetch too
    // const _fetch = window.fetch
    // window.fetch = function () {
    //   console.log('Hooked `fetch`', arguments)
    //   return _fetch.apply(this, arguments)
    // }

    const injected = (params: {
      hookConfig: HookConfig
      objectPathGet: typeof objectPathGet
      objectPathSet: typeof objectPathSet
    }) => {
      // This is used to save the destination URI during `XMLHttpRequest.prototype.open` then
      // retrieving it when `XMLHttpRequest.prototype.send` is called later
      const XMLHttpRequestUriMap = new WeakMap<any, { method: string; uri: string }>()

      const _XMLHttpRequest_open = window.XMLHttpRequest.prototype.open
      window.XMLHttpRequest.prototype.open = function () {
        // console.log('Hooked `XMLHttpRequest.prototype.open`', arguments)
        XMLHttpRequestUriMap.set(this, { method: arguments[0], uri: arguments[1] })
        return _XMLHttpRequest_open.apply(this, arguments)
      }

      const _XMLHttpRequest_send = window.XMLHttpRequest.prototype.send
      window.XMLHttpRequest.prototype.send = async function () {
        // console.log('Hooked `XMLHttpRequest.prototype.send`', XMLHttpRequestUriMap.get(this), arguments)
        const [bodyRaw] = arguments
        try {
          const { method, uri } = XMLHttpRequestUriMap.get(this)
          if (method === params.hookConfig.method && uri.includes(params.hookConfig.uri)) {
            // console.log('Hooked `XMLHttpRequest.prototype.send` API ROUTE', XMLHttpRequestUriMap.get(this), arguments)
            const body = JSON.parse(bodyRaw)
            const postContent = params.objectPathGet(
              body,
              params.hookConfig.bodyContentObjectPath,
              'Could not replace post content! XMLHttpRequest.prototype.send_objectPath.ensureExists'
            )

            console.log(`[Faker][Injected] Asking the extension to upload "${postContent}"`)

            // Ask the extension to upload the post in its context
            window.postMessage({ from: 'PAGE', type: 'UPLOAD_TO_FAKER', postContent }, '*')

            const handler = (event: MessageEvent) => {
              if (
                event.data.from === 'EXTENSION' &&
                event.data.type == 'UPLOAD_TO_FAKER_RESULT' &&
                event.data.postContent
              ) {
                const { postContent } = event.data
                console.log(`[Faker][Injected] Received result of content upload: ${postContent.replace(/\s/g, ' ')}`)

                // Replace the body
                params.objectPathSet(body, params.hookConfig.bodyContentObjectPath, postContent)

                // Unregister this listener
                window.removeEventListener('message', handler)

                // Now send the original request with its body modified
                _XMLHttpRequest_send.apply(this, [JSON.stringify(body)])
              }
            }
            window.addEventListener('message', handler)
            return
          }
        } catch (error) {
          console.error('Failed to replace the body content', error)
        }
        return _XMLHttpRequest_send.apply(this, arguments)
      }
    }

    // We inject this in the page using a `<script>` tag because the extension's content script and the page
    // do not share the same context and we need to hook `window.fetch` and `window.XMLHttpRequest`
    // from the page's context
    // (e.g. `window` from extension is different from `window` of page)
    // Note: This function will not have access to other variables so we pass them as parameters
    console.log('[Faker][Extension] Injecting necessary scripts into a `<script>` tag')
    const script = document.createElement('script')
    script.text = `(${injected.toString()})({
      hookConfig: ${JSON.stringify(this.hookConfig)},
      objectPathGet: ${objectPathGet.toString()},
      objectPathSet: ${objectPathSet.toString()},
    });`
    document.documentElement.appendChild(script)
  }
}
