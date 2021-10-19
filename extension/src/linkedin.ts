import { FakerReplacer } from './lib'
import { loadConfiguration, FAKER_CONFIG } from './config'

class LinkedInFakerReplacer extends FakerReplacer {
  getPublishButton() {
    return document.querySelector<HTMLButtonElement>('.share-actions__primary-action')!
  }

  async transformPost() {
    const textarea = document.querySelector('.editor-content > div > p')!
    const content = textarea.textContent!
    const contentExternalUri = await this.getContentExternalUri(content)
    textarea.textContent = contentExternalUri
  }
}

loadConfiguration().then(({ linkedinActivated }) => {
  if (linkedinActivated) {
    const fakerReplacer = new LinkedInFakerReplacer()
    fakerReplacer.publishButtonAddEventListenerLoopStart()
  }
})
