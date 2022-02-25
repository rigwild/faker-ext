import { FakerReplacer, getValidFakerUrlsFromString, getVideoFrame, isValidHttpUrl, readQRCode } from '../utils'
import { loadConfiguration, FAKER_EXTENSION_CONFIG } from '../config'

class LinkedInFakerReplacer extends FakerReplacer {
  private posts: ReturnType<typeof this.getElementsRequiredForReplacement> = []

  getElementsRequiredForReplacement() {
    const elements = [...document.querySelectorAll('.feed-shared-update-v2')].map(postEle => ({
      postEle, // Post container
      postSubDescriptionEle: postEle.querySelector('.feed-shared-actor__sub-description'), // Post publish datetime span
      postContentEle: postEle.querySelector('.feed-shared-text > .break-words'), // Post body
      postContentImgEle: postEle.querySelector('img'), // Post body image
      postContentVideoEle: postEle.querySelector('video') // Post body video
    }))
    this.posts = elements
    return elements
  }

  addLoadedUsingFakerTag(aFakerPost: ReturnType<typeof this.getElementsRequiredForReplacement>[0]) {
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

          // Skip if this is already loading (do not start a new request uselessly)
          if (this.currentlyLoadingURLs.has(url)) continue

          this.currentlyLoadingURLs.add(url)
          const { textPost, isError } = await this.getTextPost(url)
          this.currentlyLoadingURLs.delete(url)

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

  async renderExternallyHostedMedia() {
    // Only keep posts containing valid Faker URIs
    const fakerPostsWithMedia = this.posts.filter(x => x.postEle && (x.postContentImgEle || x.postContentVideoEle))

    // TODO: Extract as common class method
    await Promise.all(
      fakerPostsWithMedia.map(async aFakerPost => {
        let mediaType: 'image' | 'video'

        const imgEle = aFakerPost.postContentImgEle
        const imgSrc = imgEle?.src
        const videoEle = aFakerPost.postContentVideoEle
        const videoSrc = videoEle?.src

        const mediaSrc = imgSrc || videoSrc // There is only one of these in a post

        if (imgEle) mediaType = 'image'
        else if (videoEle) mediaType = 'video'

        // Media was already visited or is currently loading
        if (this.blacklistedURLs.has(mediaSrc) || this.currentlyLoadingURLs.has(mediaSrc)) {
          return
        }

        let imageDataURI: string
        if (mediaType === 'image') imageDataURI = imgSrc
        if (mediaType === 'video') imageDataURI = await getVideoFrame(videoSrc)

        this.currentlyLoadingURLs.add(mediaSrc)
        const qrCodeData = await readQRCode(imageDataURI)
        this.currentlyLoadingURLs.delete(mediaSrc)

        // Check QR code contains a HTTP URL
        if (!qrCodeData || !isValidHttpUrl(qrCodeData.data)) {
          this.blacklistedURLs.add(mediaSrc)
          return
        }

        // Check QR code contains a valid Faker URL
        const qrCodeDataResultURL = new URL(qrCodeData.data)
        if (!qrCodeDataResultURL.pathname.startsWith('/faker/api')) {
          this.blacklistedURLs.add(mediaSrc)
          return
        }

        // Replace the media with the external content
        if (mediaType === 'image') {
          imgEle.src = qrCodeDataResultURL.href
          imgEle.style.border = 'solid 4px transparent'
          imgEle.style.borderRadius = '15px'
          imgEle.style.backgroundImage =
            'linear-gradient(white, white), linear-gradient(43deg, rgb(65, 88, 208), rgb(200, 80, 192),rgb(255, 204, 112))'
          imgEle.style.backgroundOrigin = 'border-box'
          imgEle.style.backgroundClip = 'content-box, border-box'
        } else if (mediaType === 'video') {
          videoEle.src = qrCodeDataResultURL.href
          videoEle.style.border = '5px solid transparent'
          videoEle.style.borderImage =
            'linear-gradient(43deg, rgb(65, 88, 208) 0%, rgb(200, 80, 192) 46%, rgb(255, 204, 112) 100%) 5'
        }

        this.addLoadedUsingFakerTag(aFakerPost)
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
