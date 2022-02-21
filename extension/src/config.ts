export var chrome: any =
  // @ts-ignore
  window.chrome

export type FakerConfiguration = {
  serverUri: string
  serverUsername: string
  serverPassword: string
  linkedinActivated: boolean
  facebookActivated: boolean
  twitterActivated: boolean
  instagramActivated: boolean
}

const defaults: Readonly<FakerConfiguration> = Object.freeze({
  serverUri: 'http://localhost:3000',
  serverUsername: 'admin',
  serverPassword: 'admin',
  linkedinActivated: true,
  facebookActivated: true,
  twitterActivated: true,
  instagramActivated: false
})

export let FAKER_EXTENSION_CONFIG: FakerConfiguration
export const FAKER_USER_AGENT = 'faker-ext v0.1'

export const loadConfiguration = async () => {
  FAKER_EXTENSION_CONFIG = await new Promise<FakerConfiguration>(resolve => {
    chrome.storage.sync.get(defaults, (config: FakerConfiguration) => {
      resolve(config)
    })
  })
}
