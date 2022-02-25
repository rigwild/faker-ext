import jsQR from 'jsqr'
import ysFixWebmDuration from 'fix-webm-duration'
import { FAKER_EXTENSION_CONFIG, FAKER_USER_AGENT } from './config'

export type Post = {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export type QRCodeGenerator = {
  generate(data: string, settings: Record<string, any>): any
  generateHTML(data: string, settings: Record<string, any>): any
  generatePNG(data: string, settings: Record<string, any>): any
  generateSVG(data: string, settings: Record<string, any>): any
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

/** @see https://stackoverflow.com/a/3809435 */
export const getValidFakerUrlsFromString = (str: string): RegExpMatchArray[] => {
  // Regex to get all URLS
  const regex =
    /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(?:\.[a-zA-Z0-9()]{1,6})?\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
  return [...str.matchAll(regex)].filter(([match, urlPath]) => urlPath.startsWith('/faker/api/'))
}

/**
 * Convert a base64 dataURL to a File object
 * @param dataurl Base64 dataURL
 * @param filename File name
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

export function filetoBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

/** @returns Data URI of the QR code (i.e. `data:image/png;base64,...`) */
export function generateQRCode(QRCode: QRCodeGenerator, str: string): string {
  return QRCode.generatePNG(str, {
    ecclevel: 'M',
    fillcolor: '#FFFFFF',
    textcolor: '#000000',
    margin: 2,
    modulesize: 28
  })
}

// export function getVideoFrame()

/**
 * Dodge `The canvas has been tainted by cross-origin data` error by fetching the <img>.src
 * then getting its blob URL
 */
export async function loadFileThenGetBlobURL(imgURI: string): Promise<string> {
  const response = await fetch(imgURI)
  const imageBlob = await response.blob()
  return URL.createObjectURL(imageBlob)
}

/** Capture a video frame from the video element */
export async function getVideoFrame(videoURI: string): Promise<string> {
  const blobURL = await loadFileThenGetBlobURL(videoURI)
  const video = document.createElement('video')
  return new Promise((resolve, reject) => {
    video.onloadedmetadata = function () {
      video.currentTime = 0
    }
    video.onseeked = function (e) {
      const canvas = document.createElement('canvas')
      canvas.height = video.videoHeight
      canvas.width = video.videoWidth
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      resolve(canvas.toDataURL())
      canvas.remove()
      video.remove()
    }
    video.src = blobURL
  })
}

/** Read a QR Code by passing an image URI */
export async function readQRCode(imgURI: string) {
  const blobURL = await loadFileThenGetBlobURL(imgURI)

  const image = new Image()
  image.src = blobURL
  await new Promise(resolve => image.addEventListener('load', resolve))

  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext('2d')

  context.imageSmoothingEnabled = false
  context.drawImage(image, 0, 0)
  const imageData = context.getImageData(0, 0, image.width, image.height)

  const code = jsQR(imageData.data, image.width, image.height)
  canvas.remove()
  return code
}

export function imageToShortVideo(imageDataUrl: string): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.height = 1140
    canvas.width = 1140

    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = imageDataUrl

    img.onload = function () {
      ctx.drawImage(img, 0, 0)
    }

    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
    const drawDot = (x: number, y: number) => {
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, 2 * Math.PI)
      ctx.fillStyle = `rgba(${rand(0, 254)}, ${rand(0, 254)}, ${rand(0, 254)}, 1)`
      ctx.fill()
    }

    // Draw dots at the bottom just to make the file size bigger
    // (LinkedIn doesn't accept videos with a size smaller than 75 KB)
    let isDrawingNewDots = true
    let lastDraw = 0
    let finished = false

    function draw() {
      if (isDrawingNewDots) {
        for (let i = 0; i < 20; i++) {
          let x = rand(300, canvas.width - 300)
          let y = rand(canvas.height - 30, canvas.height - 10)
          drawDot(x, y)
        }
      }

      // Remove the dots once in a while
      if (lastDraw > 20) {
        ctx.drawImage(img, 0, 0)
        lastDraw = 0
      }
      lastDraw++
      if (!finished) requestAnimationFrame(draw)
    }

    draw()

    const recordedChunks = []
    const mediaRecorder = new MediaRecorder(canvas.captureStream(60 /* FPS */), { mimeType: 'video/webm' })

    // console.log('recording')
    let startTime = Date.now()
    mediaRecorder.start(1)

    // Take a 3s video (we wait 4.5s to compensate for recording lag)
    new Promise(res => setTimeout(res, 4500)).then(() => {
      mediaRecorder.stop()
      finished = true
      canvas.remove()
    })

    mediaRecorder.ondataavailable = event => {
      // console.log('ondataavailable')
      recordedChunks.push(event.data)
    }

    mediaRecorder.onstop = async event => {
      // console.log('onstop')
      const buggyBlob = new Blob(recordedChunks, { type: 'video/webm' })

      let duration = Date.now() - startTime
      // console.log(buggyBlob)
      // console.log(URL.createObjectURL(buggyBlob))

      // MediaRecorder won't add proper video metadata https://bugs.chromium.org/p/chromium/issues/detail?id=642012
      // Use this lib to fix this shit 😘
      const fixedBlob = await ysFixWebmDuration(buggyBlob, duration - 1500 /*, {logger: false}*/)
      console.log(fixedBlob)
      console.log('[Faker] QR code video blob URI', URL.createObjectURL(fixedBlob))

      resolve(fixedBlob)
    }
  })
}

/**
 * Retrieve text post content from the self-hosted server
 * @param uri Text post external uri
 * @returns Text post content
 */
export async function loadTextPostFromServer(uri: string): Promise<Post> {
  console.log(`[Faker] Loading content from uri ${uri}`)
  const res = await fetch(uri, {
    headers: {
      Accept: 'application/json',
      'User-Agent': FAKER_USER_AGENT
    }
  })
  const resJson = await res.json()
  if (!res.ok) throw new Error(resJson.message)
  return resJson
}

/**
 * Upload the text post to the self-hosted server and get its URI
 * @param content Post content
 * @param websiteURL URL of the website where the post comes from
 * @returns Link to the self-hosted content
 */
export async function uploadTextPostToServer(content: string, websiteURL: URL): Promise<string> {
  const summary = content.length > 50 ? `${content.slice(0, 50)}...` : content
  console.log(`[Faker] Uploading the post "${summary}"...`)

  const res = await fetch(`${FAKER_EXTENSION_CONFIG.serverUri}/faker/api/upload`, {
    method: 'POST',
    body: JSON.stringify({ content }),
    headers: {
      'User-Agent': FAKER_USER_AGENT,
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(
        `${FAKER_EXTENSION_CONFIG.serverUsername}:${FAKER_EXTENSION_CONFIG.serverPassword}`
      )}`,
      'X-Faker-Domain': websiteURL?.hostname
    }
  })
  const resJson = await res.json()
  if (!res.ok) throw new Error(resJson.message)

  const { externalUri } = resJson
  const fullExternalUri = `${FAKER_EXTENSION_CONFIG.serverUri}${externalUri}`
  console.log(`[Faker] External link generated by the server for text post: ${fullExternalUri}`)
  return fullExternalUri
}

/**
 * Upload the media to the self-hosted server and get its URI
 * @param media Uploaded media
 * @param websiteURL URL of the website where the media comes from
 * @returns Link to the self-hosted content
 */
export async function uploadMediaToServer(media: File, websiteURL: URL): Promise<string> {
  console.log(`[Faker] Uploading the media "${media.name}" with type "${media.type}"...`)

  const formData = new FormData()
  formData.append('media', media)

  const res = await fetch(`${FAKER_EXTENSION_CONFIG.serverUri}/faker/api/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'User-Agent': FAKER_USER_AGENT,
      Authorization: `Basic ${btoa(
        `${FAKER_EXTENSION_CONFIG.serverUsername}:${FAKER_EXTENSION_CONFIG.serverPassword}`
      )}`,
      'X-Faker-Domain': websiteURL?.hostname
    }
  })
  const resJson = await res.json()
  if (!res.ok) throw new Error(resJson.message)

  const { externalUri } = resJson
  const fullExternalUri = `${FAKER_EXTENSION_CONFIG.serverUri}${externalUri}`
  console.log(`[Faker] External link generated by the server for media: ${fullExternalUri}`)
  return fullExternalUri
}

/**
 * Upload the text post to the self-hosted server and get its URI
 * @param content Post content
 * @param websiteURL URL of the website where the post comes from
 * @returns Link to the self-hosted content
 */
export async function deleteContentFromServer(id: string): Promise<void> {
  console.log(`[Faker] Deleting the post with ID "${id}"...`)

  const res = await fetch(`${FAKER_EXTENSION_CONFIG.serverUri}/faker/api/posts`, {
    method: 'DELETE',
    headers: {
      'User-Agent': FAKER_USER_AGENT,
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(
        `${FAKER_EXTENSION_CONFIG.serverUsername}:${FAKER_EXTENSION_CONFIG.serverPassword}`
      )}`
    }
  })
  const resJson = await res.json()
  if (!res.ok) throw new Error(resJson.message)

  const { externalUri } = resJson
  const fullExternalUri = `${FAKER_EXTENSION_CONFIG.serverUri}${externalUri}`
  console.log(`[Faker] External link generated by the server for text post: ${fullExternalUri}`)
}

export abstract class FakerReplacer {
  protected textPostCache = new Map<string, Post>()
  protected currentlyLoadingURLs = new Set<string>()
  protected blacklistedURLs = new Set<string>()

  constructor() {
    this.startRenderExternallyHostedContent()
    console.log('[Faker] Extension initialized!')
  }

  abstract getElementsRequiredForReplacement(): any

  abstract addLoadedUsingFakerTag(aPostEle: any): void

  /** Apply feed posts text transformation in the DOM */
  abstract renderExternallyHostedText(): Promise<void>

  /** Apply feed posts medias transformation in the DOM */
  abstract renderExternallyHostedMedia(): Promise<void>

  protected async getTextPost(url: string): Promise<{ textPost: Post; isError: boolean }> {
    let textPost: Post
    let isError = false

    try {
      if (this.textPostCache.has(url)) {
        textPost = this.textPostCache.get(url)
      } else {
        textPost = await loadTextPostFromServer(url)
        this.textPostCache.set(url, textPost)
      }
    } catch (error) {
      isError = true
      console.log(`[Faker] Failed to load external content for uri "${url}"`, error)

      if (error.message.startsWith('No post with ID')) {
        error.message = 'Content not found'
      }

      textPost = { content: `Faker Error: ${error.message}` } as Post
      this.textPostCache.set(url, textPost)
    }

    return { textPost, isError }
  }

  protected replaceStrAtPosition(
    str: string,
    postContentEle: Element,
    url: string,
    urlPositionIndex: number,
    linkOffset: number,
    isError: boolean
  ): number {
    // Inject the post content into a span with textContent first to prevent XSS
    const tempEle = document.createElement('div')
    const span = document.createElement('span')
    span.textContent = str
    span.style.color = 'white'
    span.style.borderRadius = '5px'
    span.style.padding = '1px 2px'
    span.style.backgroundColor = !isError ? '#3a3a3a' : '#e00404'
    tempEle.append(span)
    const elementToInject = tempEle.innerHTML

    // Inject the sanitized post content into the post container
    const postHTML = postContentEle.innerHTML
    const postHTMLBefore = postHTML.slice(0, urlPositionIndex + linkOffset)
    const postHTMLAfter = postHTML.slice(urlPositionIndex + linkOffset + url.length)
    //  console.log(postHTMLBefore)
    //  console.log(spanHTML)
    //  console.log(postHTMLAfter)
    postContentEle.innerHTML = postHTMLBefore + elementToInject + postHTMLAfter

    const newLinkOffset = linkOffset + elementToInject.length - url.length
    return newLinkOffset
  }

  private startRenderExternallyHostedContent() {
    setInterval(() => {
      this.getElementsRequiredForReplacement()
      this.renderExternallyHostedText()
      this.renderExternallyHostedMedia()
    }, 1000)
  }
}

export const loadingSvg = `<?xml version="1.0" encoding="utf-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="100px" height="100px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
  <circle cx="50" cy="50" r="0" fill="none" stroke="#85a2b6" stroke-width="2">
    <animate attributeName="r" repeatCount="indefinite" dur="1.1111111111111112s" values="0;40" keyTimes="0;1" keySplines="0 0.2 0.8 1" calcMode="spline" begin="0s"></animate>
    <animate attributeName="opacity" repeatCount="indefinite" dur="1.1111111111111112s" values="1;0" keyTimes="0;1" keySplines="0.2 0 0.8 1" calcMode="spline" begin="0s"></animate>
  </circle><circle cx="50" cy="50" r="0" fill="none" stroke="#bbcedd" stroke-width="2">
    <animate attributeName="r" repeatCount="indefinite" dur="1.1111111111111112s" values="0;40" keyTimes="0;1" keySplines="0 0.2 0.8 1" calcMode="spline" begin="-0.5555555555555556s"></animate>
    <animate attributeName="opacity" repeatCount="indefinite" dur="1.1111111111111112s" values="1;0" keyTimes="0;1" keySplines="0.2 0 0.8 1" calcMode="spline" begin="-0.5555555555555556s"></animate>
  </circle>
  </svg>`
