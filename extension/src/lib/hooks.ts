// console.log('hook me bro', window.fetch, window.XMLHttpRequest)
// TODO: Hook fetch too
// const _fetch = window.fetch
// window.fetch = function () {
//   console.log('Hooked `fetch`', arguments)
//   return _fetch.apply(this, arguments)
// }

import { HookConfig } from '.'
import { objectPathGet, objectPathSet } from './utils'

export const injected = (params: {
  hookConfig: HookConfig
  objectPathGet: typeof objectPathGet
  objectPathSet: typeof objectPathSet
}) => {
  // This is used to save the destination URI during `XMLHttpRequest.prototype.open` then
  // retrieving it when `XMLHttpRequest.prototype.send` is called later
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
      if (method === params.hookConfig.method && uri.includes(params.hookConfig.uri)) {
        console.log('Hooked `XMLHttpRequest.prototype.send` API ROUTE', XMLHttpRequestUriMap.get(this), arguments)
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

export const scriptToInject = (hookConfig: HookConfig): string => `(${injected.toString()})({
  hookConfig: ${JSON.stringify(hookConfig)},
  objectPathGet: ${objectPathGet.toString()},
  objectPathSet: ${objectPathSet.toString()},
});`
