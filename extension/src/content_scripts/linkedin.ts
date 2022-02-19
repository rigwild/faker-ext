import { FakerReplacer, getValidFakerUrlsFromString, loadTextPostFromServer, Post } from '../utils'
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
          const { index: urlPositionIndex, 0: url } = aUrlMatch
          let success = true
          let textPost: Post
          try {
            textPost = await loadTextPostFromServer(url)
          } catch (error) {
            success = false
            console.error(`[Faker] Failed to load external content for uri "${url}"`, error)
            textPost = { content: `Faker Error: ${error.message}` } as Post
          }

          const newLinkOffset = this.injectStrAtPosition(
            textPost.content,
            aFakerPost.postContentEle,
            url,
            urlPositionIndex,
            linkOffset
          )
          linkOffset = newLinkOffset
        }

        // Show that the post was replaced by Faker
        aFakerPost.postSubDescriptionEle.innerHTML += '<span style="color: #ff00e7;">Loaded using Faker ✨</span>'
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
