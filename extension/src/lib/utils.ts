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
