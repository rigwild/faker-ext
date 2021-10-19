import { FakerReplacer } from './lib'

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

const fakerReplacer = new LinkedInFakerReplacer()
fakerReplacer.publishButtonAddEventListenerLoopStart()
