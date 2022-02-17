import { createApp, reactive } from 'petite-vue'

import { FakerConfiguration, FAKER_EXTENSION_CONFIG, FAKER_USER_AGENT, loadConfiguration } from '../src/config'

declare var chrome: any

loadConfiguration().then(() => {
  const store: FakerConfiguration = reactive(FAKER_EXTENSION_CONFIG)

  createApp({
    store,

    isLoading: false,
    checkConfigurationResult: '',
    async checkConfiguration() {
      this.isLoading = true
      this.checkConfigurationResult = ''
      try {
        const { serverUri, serverUsername, serverPassword } = store
        const res = await fetch(`${serverUri}/faker/api/config-check`, {
          method: 'POST',
          headers: {
            'User-Agent': FAKER_USER_AGENT,
            Authorization: `Basic ${btoa(`${serverUsername}:${serverPassword}`)}`
          }
        })
        if (!res.ok) {
          const resJson = await res.json()
          throw new Error(`Connection failed! Error: ${resJson.error}`)
        }
        this.checkConfigurationResult = 'Connection successful!'
      } catch (error) {
        console.log(error)
        if (error.message === 'Failed to fetch')
          this.checkConfigurationResult = 'Could not reach your server! Check its URI is correct and reachable.'
        else this.checkConfigurationResult = error.message
      } finally {
        this.isLoading = false
      }
    },
    save() {
      chrome.storage.sync.set(store, () => console.log('Saved', store))
    }
  }).mount()
})
