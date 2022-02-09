import { createApp, reactive } from 'petite-vue'

import { FakerConfiguration, loadConfiguration } from '../src/config'

declare var chrome: any

const store: FakerConfiguration = reactive(await loadConfiguration())

createApp({
  store,
  save() {
    chrome.storage.sync.set(store, () => console.log('Saved', store))
  }
}).mount()
