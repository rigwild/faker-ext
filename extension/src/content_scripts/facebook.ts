import { FakerReplacer, isValidHttpUrl, Post } from './lib'
import { loadConfiguration, FAKER_EXTENSION_CONFIG } from '../config'

class FacebookFakerReplacer extends FakerReplacer {
  async renderExternallyHostedPosts() {
    const posts = [
      ...document.querySelectorAll('div[role="article"] > div > div > div > div > div > div:nth-child(2):not([class])')
    ].map(x => ({
      postEle: x, // Post container
      postSubDescriptionEle: x.querySelector('a[role="link"] > span'), // Post publish datetime span
      postContentEle: x.getElementsByClassName('kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x c1et5uql')[0]?.parentElement // Post body
    }))

    // Only keep Faker-related posts with valid URIs
    console.log(posts[0].postContentEle.textContent)
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
      postSubDescriptionEle.innerHTML +=
        '<span style="color: #ff00e7; padding-left: 5px;">Loaded from Faker server ✨</span>'
      postContentEle.textContent =
        externalContent.success === true ? externalContent.post.content : externalContent.message
    }
  }
}

loadConfiguration().then(() => {
  if (FAKER_EXTENSION_CONFIG.facebookActivated) {
    console.log('[Faker][Extension] Faker activated for LinkedIn!')

    // new FacebookFakerReplacer(/*{
    //   textReplace: {
    //     method: 'POST',
    //     uri: '/api/graphql',
    //     bodyContentObjectPath: 'commentaryV2.text'
    //   },
    //   imageReplace: {
    //     method: 'PUT',
    //     uri: '/dms-uploads'
    //   }
    // }*/)
  }
})
