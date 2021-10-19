declare var chrome: any

export type FakerConfiguration = {
  serverUri: string
  serverPassword: string
  linkedinActivated: boolean
  facebookActivated: boolean
  twitterActivated: boolean
  instagramActivated: boolean
}

const defaults: Readonly<FakerConfiguration> = Object.freeze({
  serverUri: 'http://localhost:3000',
  serverPassword: 'hi',
  linkedinActivated: true,
  facebookActivated: false,
  twitterActivated: false,
  instagramActivated: false
})

export let FAKER_CONFIG: FakerConfiguration

export const loadConfiguration = async () => {
  FAKER_CONFIG = await new Promise<FakerConfiguration>(resolve =>
    chrome.storage.sync.get(defaults, (config: FakerConfiguration) => resolve(config))
  )
  return FAKER_CONFIG
}
