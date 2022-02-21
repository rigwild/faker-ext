import { createApp, reactive } from 'petite-vue'

import { FakerConfiguration, FAKER_EXTENSION_CONFIG, FAKER_USER_AGENT, loadConfiguration } from '../src/config'
import { uploadMediaToServer, uploadTextPostToServer } from '../src/utils'

declare var chrome: any

loadConfiguration().then(() => {
  const configurationStore: FakerConfiguration = reactive(FAKER_EXTENSION_CONFIG)

  createApp({
    configurationStore,

    isLoadingConfigCheck: false,
    checkConfigurationResult: '',

    isLoadingUpload: false,
    uploadWhatType: 'text', // 'text' | 'file'
    uploadText: '',
    uploadResult: '',
    uploadResultLink: '',

    async checkConfiguration() {
      this.isLoadingConfigCheck = true
      this.checkConfigurationResult = ''
      try {
        const { serverUri, serverUsername, serverPassword } = configurationStore
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
        this.isLoadingConfigCheck = false
      }
    },

    async upload(event?: Event) {
      if (this.uploadWhatType === 'text' && !this.uploadText) {
        this.uploadResult = `Your post cannot be empty!`
        return
      }

      this.isLoadingUpload = true
      this.uploadResult = ''
      this.uploadResultLink = ''
      try {
        let fullExternalUri: string
        if (this.uploadWhatType === 'text') {
          fullExternalUri = await uploadTextPostToServer(this.uploadText, null)
        } else if (this.uploadWhatType === 'file') {
          fullExternalUri = await uploadMediaToServer((event.target as HTMLInputElement).files[0], null)
        }

        this.uploadResult = `Your file has been uploaded! You can share it on the web with the following link:`
        this.uploadResultLink = fullExternalUri
        this.uploadText = ''
      } catch (error) {
        console.log(error)
        this.uploadResult = error.message
      } finally {
        this.isLoadingUpload = false
      }
    },
    save() {
      chrome.storage.sync.set(configurationStore, () => console.log('Saved', configurationStore))
    }
  }).mount()
})
