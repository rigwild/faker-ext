import { FakerReplacer, getValidFakerUrlsFromString } from '../utils'
import { loadConfiguration, FAKER_EXTENSION_CONFIG } from '../config'

class FacebookFakerReplacer extends FakerReplacer {
  private posts: ReturnType<typeof this.getElementsRequiredForReplacement> = []

  getElementsRequiredForReplacement() {
    const elements = [
      ...document.querySelectorAll('div[role="article"] > div > div > div > div > div > div:nth-child(2):not([class])')
    ].map(x => ({
      postEle: x, // Post container
      postSubDescriptionEle: x.querySelector('a[role="link"] > span'), // Post publish datetime span
      postContentEle: x.getElementsByClassName('kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x c1et5uql')[0]?.parentElement // Post body
    }))
    this.posts = elements
    return elements
  }

  addLoadedUsingFakerTag(aPostEle: any): void {
    if (!aPostEle.postSubDescriptionEle.innerHTML.includes('Faker')) {
      aPostEle.postSubDescriptionEle.innerHTML +=
        '<span style="' +
        'color: white;' +
        'border-radius: 5px;' +
        'padding: 1px 4px;' +
        'background-color: rgb(65, 88, 208);' +
        'background-image: linear-gradient(43deg, rgb(65, 88, 208) 0%, rgb(200, 80, 192) 46%, rgb(255, 204, 112) 100%);' +
        '">Loaded using Faker ✨</span>'
    }
  }

  async renderExternallyHostedText() {
    // Only keep posts containing valid Faker URIs
    const fakerPosts = this.posts
      .filter(x => x.postEle && x.postSubDescriptionEle && x.postContentEle)
      .map(x => ({ ...x, regexMatchedUrls: getValidFakerUrlsFromString(x.postContentEle.innerHTML) }))
      .filter(x => x.regexMatchedUrls.length > 0)

    // console.log(fakerPosts)

    // Load external content
    await Promise.all(
      fakerPosts.map(async aFakerPost => {
        // Compute the offset of the currently replaced link
        // (so the next replaced link in this post can be replaced at the appropriate positions)
        let linkOffset = 0
        for (const aUrlMatch of aFakerPost.regexMatchedUrls) {
          const { 0: url, index: urlPositionIndex } = aUrlMatch

          const { textPost, isError } = await this.getTextPost(url)

          const newLinkOffset = this.replaceStrAtPosition(
            textPost.content,
            aFakerPost.postContentEle,
            url,
            urlPositionIndex,
            linkOffset,
            isError
          )
          linkOffset = newLinkOffset
        }

        // Show that the post was replaced by Faker
        this.addLoadedUsingFakerTag(aFakerPost)
      })
    )
  }

  renderExternallyHostedMedia(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

loadConfiguration().then(() => {
  if (FAKER_EXTENSION_CONFIG.facebookActivated) {
    console.log('[Faker][Extension] Faker activated for Facebook!')
    new FacebookFakerReplacer()
  }
})
