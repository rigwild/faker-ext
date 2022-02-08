import { FAKER_EXTENSION_CONFIG, FAKER_USER_AGENT } from '../config'

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

/**
 * Convert a base64 dataURL to a File object
 * @param dataurl Base64 dataURL
 * @param [filename] File name
 * @see https://stackoverflow.com/a/38935990
 */
export const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, { type: mime })
}

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
