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
