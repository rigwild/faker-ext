import { FakerReplacer, getValidFakerUrlsFromString } from '../utils'
import { loadConfiguration, FAKER_EXTENSION_CONFIG } from '../config'

class LinkedInFakerReplacer extends FakerReplacer {
  async renderExternallyHostedPosts() {
    const posts = [...document.querySelectorAll('.feed-shared-update-v2')].map(postEle => ({
      postEle, // Post container
      postSubDescriptionEle: postEle.querySelector('.feed-shared-actor__sub-description'), // Post publish datetime span
      postContentEle: postEle.querySelector('.feed-shared-text > .break-words') // Post body
    }))

    // Only keep posts containing valid Faker URIs
    const fakerPosts = posts
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
        if (!aFakerPost.postSubDescriptionEle.innerHTML.includes('Faker')) {
          aFakerPost.postSubDescriptionEle.innerHTML +=
            '<span style="' +
            'color: white;' +
            'border-radius: 5px;' +
            'padding: 1px 4px;' +
            'background-color: rgb(65, 88, 208);' +
            'background-image: linear-gradient(43deg, rgb(65, 88, 208) 0%, rgb(200, 80, 192) 46%, rgb(255, 204, 112) 100%);' +
            '">Loaded using Faker ✨</span>'
        }
      })
    )
  }
}

loadConfiguration().then(() => {
  if (FAKER_EXTENSION_CONFIG.linkedinActivated) {
    console.log('[Faker][Extension] Faker activated for LinkedIn!')
    new LinkedInFakerReplacer()
  }
})
