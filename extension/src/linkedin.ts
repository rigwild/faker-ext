import { FakerReplacer, isValidHttpUrl, Post } from './lib'
import { loadConfiguration } from './config'

class LinkedInFakerReplacer extends FakerReplacer {
  async renderExternallyHostedPosts() {
    const posts = [...document.querySelectorAll('.feed-shared-update-v2')].map(x => ({
      postEle: x, // Post container
      postSubDescriptionEle: x.querySelector('.feed-shared-actor__sub-description'), // Post publish datetime span
      postContentEle: x.querySelector('.feed-shared-text > .break-words') // Post body
    }))

    // Only keep Faker-related posts with valid URIs
    const fakerPosts = posts
      .filter(x => x.postSubDescriptionEle && x.postContentEle)
      .filter(x => x.postContentEle.textContent.trim().includes(FakerReplacer.fakerPostTag))
      .map(x => ({ ...x, uri: x.postContentEle.textContent.replace(FakerReplacer.fakerPostTag, '').trim() }))
      .filter(x => isValidHttpUrl(x.uri))

    // Load external content
    const fakerPostsWithLoadedContent = await Promise.all(
      fakerPosts.map(async x => {
        let externalContent: { post: Post; success: true } | { message: string; success: false }
        try {
          externalContent = { post: await this.loadContentFromServer(x.uri), success: true }
        } catch (error) {
          console.error(`[Faker] Failed to load external content for uri "${x.uri}"`, error)
          externalContent = { message: `Faker Error: ${error.message}`, success: false }
        }
        return { ...x, externalContent }
      })
    )

    // Replace the posts
    for (const { postSubDescriptionEle, postContentEle, externalContent } of fakerPostsWithLoadedContent) {
      postSubDescriptionEle.innerHTML += '<span style="color: #ff00e7;">Loaded from Faker server ✨</span>'
      postContentEle.textContent =
        externalContent.success === true ? externalContent.post.content : externalContent.message
    }
  }
}

loadConfiguration().then(({ linkedinActivated }) => {
  if (linkedinActivated) {
    new LinkedInFakerReplacer({
      textReplace: {
        method: 'POST',
        uri: '/voyager/api/contentcreation/normShares',
        bodyContentObjectPath: 'commentaryV2.text'
      },
      imageReplace: {
        method: 'PUT',
        uri: '/dms-uploads'
      }
    })
  }
})
