// console.log('hook me bro', window.fetch, window.XMLHttpRequest)
// TODO: Hook fetch too
// const _fetch = window.fetch
// window.fetch = function () {
//   console.log('Hooked `fetch`', arguments)
//   return _fetch.apply(this, arguments)
// }

import { HookConfig } from './index'
import { dataURLtoFile, objectPathGet, objectPathSet } from './utils'
import { placeholderImageBase64 } from './placeholderImageBase64'

/**
 * Hook a text post publish request
 */
function hookTextPostPublish(params: ReturnType<typeof injectedParams>, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let postContent = params.objectPathGet(
      body,
      params.hookConfig.textReplace.bodyContentObjectPath,
      'Could not replace post content! XMLHttpRequest.prototype.send_objectPath.objectPathGet'
    )

    // If post is empty (e.g. publishing with an image attachment), make it not empty
    postContent ||= ' '

    console.log(`[Faker][Injected] Asking the extension to upload text: "${postContent}"`)

    const handler = (event: MessageEvent) => {
      if (
        event.data.from === 'EXTENSION' &&
        event.data.type == 'UPLOAD_TO_FAKER_TEXT_RESULT' &&
        event.data.postContent
      ) {
        const newPostContent = event.data.postContent as string
        console.log(`[Faker][Injected] Received result of text upload: ${newPostContent.replace(/\s/g, ' ')}`)

        // Replace the body
        params.objectPathSet(body, params.hookConfig.textReplace.bodyContentObjectPath, newPostContent)

        // Unregister this listener now that it was used successfully
        window.removeEventListener('message', handler)

        resolve(body)
      }
    }
    window.addEventListener('message', handler)

    // Ask the extension to upload the post in its context
    window.postMessage({ from: 'PAGE', type: 'UPLOAD_TO_FAKER_TEXT', postContent }, '*')
  })
}

/**
 * Hook a media upload request
 */
function hookMediaPublish(params: ReturnType<typeof injectedParams>, media: File): Promise<File> {
  return new Promise((resolve, reject) => {
    console.log(`[Faker][Injected] Asking the extension to upload media: "${media.name}" with type "${media.type}"`)

    const handler = (event: MessageEvent) => {
      if (event.data.from === 'EXTENSION' && event.data.type == 'UPLOAD_TO_FAKER_MEDIA_RESULT' && event.data.media) {
        const newMediaUri = event.data.media as string
        console.log(`[Faker][Injected] Received result of media upload: ${newMediaUri.replace(/\s/g, ' ')}`)

        // Unregister this listener now that it was used successfully
        window.removeEventListener('message', handler)

        // Return the Faker QR code
        resolve(params.dataURLtoFile(params.placeholderImageBase64, 'qrcode.png'))
      }
    }
    window.addEventListener('message', handler)

    // Ask the extension to upload the post in its context
    window.postMessage({ from: 'PAGE', type: 'UPLOAD_TO_FAKER_MEDIA', media }, '*')
  })
}

const injectedParams = (hookConfig: HookConfig) => ({
  hookConfig,
  objectPathGet,
  objectPathSet,
  hookTextPostPublish,
  hookMediaPublish,
  dataURLtoFile,
  placeholderImageBase64
})

function injectedFn(params: ReturnType<typeof injectedParams>) {
  // This is used to save the destination URI during `XMLHttpRequest.prototype.open` then
  // retrieving it when `XMLHttpRequest.prototype.send` is called later
  // Key is cleared when the request is fully finished and its object destroyed by the browser (WeakMap)
  const XMLHttpRequestUriMap = new WeakMap<any, { method: string; uri: string }>()

  const _XMLHttpRequest_open = window.XMLHttpRequest.prototype.open
  window.XMLHttpRequest.prototype.open = function () {
    console.log('Hooked `XMLHttpRequest.prototype.open`', arguments)
    XMLHttpRequestUriMap.set(this, { method: arguments[0], uri: arguments[1] })
    return _XMLHttpRequest_open.apply(this, arguments)
  }

  const _XMLHttpRequest_send = window.XMLHttpRequest.prototype.send
  window.XMLHttpRequest.prototype.send = async function () {
    console.log('Hooked `XMLHttpRequest.prototype.send`', XMLHttpRequestUriMap.get(this), arguments)
    const [bodyRaw] = arguments
    try {
      const { method, uri } = XMLHttpRequestUriMap.get(this)

      // Check if request is a text post publish
      if (method === params.hookConfig.textReplace.method && uri.includes(params.hookConfig.textReplace.uri)) {
        console.log('Hooked `XMLHttpRequest.prototype.send` API ROUTE textReplace', { method, uri }, arguments)

        const body = JSON.parse(bodyRaw)
        const newBody = await params.hookTextPostPublish(params, body)
        console.log('newBody', newBody)

        // Now send the original request with its body replaced
        _XMLHttpRequest_send.apply(this, [JSON.stringify(newBody)])
        return
      }
      // Check if request is an image post publish
      else if (method === params.hookConfig.imageReplace.method && uri.includes(params.hookConfig.imageReplace.uri)) {
        console.log('Hooked `XMLHttpRequest.prototype.send` API ROUTE imageReplace', { method, uri }, arguments)

        const media = arguments[0] as File
        const newMedia = params.hookMediaPublish(params, media)
        console.log('newMedia', newMedia)

        // Now send the original request with its file replaced
        _XMLHttpRequest_send.apply(this, [newMedia])
        return
      }
    } catch (error) {
      console.error('Failed to replace the body content', error)
    }

    // Call was not matched with replacable URIs, send it as is, unmodified
    return _XMLHttpRequest_send.apply(this, arguments)
  }
}

/**
 * Generate a valid JavaScript string containing hooks
 * Note: The injected function will not have access to other variables from this context
 * so we pass them as parameters
 *
 * Generates something like this:
 *
 * ```ts
 * ((params) => {
 *  // `injectedFn` content
 * })({
 *   hookConfig: { ... },
 *   hookTextPostPublish: () => { ... },
 *   ...,
 * });
 * ```
 *
 * @param hookConfig Specific website hook configuration
 * @returns A valid JavaScript string
 */
export function scriptToInject(hookConfig: HookConfig): string {
  let params = {}
  // Serialize all passed functions
  Object.entries(injectedParams(hookConfig)).forEach(([k, v]) => {
    if (typeof v === 'function') params[k] = v.toString()
    else params[k] = JSON.stringify(v)
  })
  // Convert parameters to valid JavaScript string
  const paramsStr =
    '{' +
    Object.entries(params).reduce((acc, [k, v]) => {
      acc += `"${k}": ${v},`
      return acc
    }, '') +
    '}'
  return `(${injectedFn.toString()})(${paramsStr});`
}
